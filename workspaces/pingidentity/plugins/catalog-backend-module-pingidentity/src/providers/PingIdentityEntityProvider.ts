/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  LoggerService,
  SchedulerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
  GroupEntityV1alpha1,
  UserEntityV1alpha1,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import * as uuid from 'uuid';
import { PingIdentityProviderConfig, readProviderConfigs } from '../lib/config';
import { readPingIdentity } from '../lib/read';
import { UserTransformer, GroupTransformer } from '../lib/types';
import { PingIdentityClient } from '../lib/client';

/**
 * Options for {@link PingIdentityEntityProvider}.
 *
 * @public
 */
export interface PingIdentityEntityProviderOptions {
  /**
   * The refresh schedule to use.
   *
   * @defaultValue "manual"
   * @remarks
   *
   * If you pass in 'manual', you are responsible for calling the `read` method
   * manually at some interval.
   *
   * But more commonly you will pass in the result of
   * {@link @backstage/backend-tasks#SchedulerService.createScheduledTaskRunner}
   * to enable automatic scheduling of tasks.
   */
  schedule?: 'manual' | SchedulerServiceTaskRunner;

  /**
   * Scheduler used to schedule refreshes based on
   * the schedule config.
   */
  scheduler?: SchedulerService;

  /**
   * The logger to use.
   */
  logger: LoggerService;
  /**
   * The function that transforms a user entry in LDAP to an entity.
   */
  userTransformer?: UserTransformer;

  /**
   * The function that transforms a group entry in LDAP to an entity.
   */
  groupTransformer?: GroupTransformer;
}

/**
 * Ingests org data (users and groups) from Ping Identity.
 *
 * @public
 */
export class PingIdentityEntityProvider implements EntityProvider {
  private connection?: EntityProviderConnection;
  private scheduleFn?: () => Promise<void>;

  static fromConfig(
    configRoot: Config,
    options: PingIdentityEntityProviderOptions,
  ): PingIdentityEntityProvider[] {
    return readProviderConfigs(configRoot).map(providerConfig => {
      let taskRunner;
      if (options.scheduler && providerConfig.schedule) {
        // Create a scheduled task runner using the provided scheduler and schedule configuration
        taskRunner = options.scheduler.createScheduledTaskRunner(
          providerConfig.schedule,
        );
      } else if (options.schedule) {
        // Use the provided schedule directly
        taskRunner = options.schedule;
      } else {
        throw new Error(
          `No schedule provided neither via code nor config for PingIdentityEntityProvider:${providerConfig.id}.`,
        );
      }

      const provider = new PingIdentityEntityProvider({
        id: providerConfig.id,
        provider: providerConfig,
        logger: options.logger,
        userTransformer: options.userTransformer,
        groupTransformer: options.groupTransformer,
      });

      if (taskRunner !== 'manual') {
        provider.schedule(taskRunner);
      }

      return provider;
    });
  }

  constructor(
    private options: {
      id: string;
      provider: PingIdentityProviderConfig;
      logger: LoggerService;
      userTransformer?: UserTransformer;
      groupTransformer?: GroupTransformer;
    },
  ) {}

  getProviderName(): string {
    return `PingIdentityEntityProvider:${this.options.id}`;
  }

  async connect(connection: EntityProviderConnection) {
    this.connection = connection;
    await this.scheduleFn?.();
  }

  /**
   * Runs one complete ingestion loop. Call this method regularly at some
   * appropriate cadence.
   */
  async read(options?: { logger?: LoggerService }) {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const logger = options?.logger ?? this.options.logger;
    const provider = this.options.provider;

    const { markReadComplete } = trackProgress(logger);
    const client = new PingIdentityClient(provider);
    const { users, groups } = await readPingIdentity(client, {
      userQuerySize: this.options.provider.userQuerySize,
      groupQuerySize: this.options.provider.groupQuerySize,
      userTransformer: this.options.userTransformer,
      groupTransformer: this.options.groupTransformer,
    });

    await this.connection.applyMutation({
      type: 'full',
      entities: [...users, ...groups].map(entity => ({
        locationKey: `pingidentity-org-provider:${this.options.id}`,
        entity: entity,
      })),
    });
    const { markCommitComplete } = markReadComplete({ users, groups });
    markCommitComplete();
  }

  schedule(taskRunner: SchedulerServiceTaskRunner) {
    this.scheduleFn = async () => {
      const id = `${this.getProviderName()}:refresh`;
      await taskRunner.run({
        id,
        fn: async () => {
          const logger = this.options.logger.child({
            class: PingIdentityEntityProvider.prototype.constructor.name,
            taskId: id,
            taskInstanceId: uuid.v4(),
          });

          try {
            await this.read({ logger });
          } catch (error: any) {
            // Ensure that we don't log any sensitive internal data:
            logger.error('Error while syncing PingIdentity users and groups', {
              // Default Error properties:
              name: error.name,
              message: error.message,
              stack: error.stack,
              // Additional status code if available:
              status: error.response?.status,
            });
          }
        },
      });
    };
  }
}

// Helps wrap the timing and logging behaviors
function trackProgress(logger: LoggerService) {
  let timestamp = Date.now();
  let summary: string;

  logger.info('Reading PingIdentity users and groups');

  function markReadComplete(read: {
    users: UserEntityV1alpha1[];
    groups: GroupEntityV1alpha1[];
  }) {
    summary = `${read.users.length} PingIdentity users and ${read.groups.length} PingIdentity groups`;
    const readDuration = ((Date.now() - timestamp) / 1000).toFixed(1);
    timestamp = Date.now();
    logger.info(`Read ${summary} in ${readDuration} seconds. Committing...`);
    return { markCommitComplete };
  }

  function markCommitComplete() {
    const commitDuration = ((Date.now() - timestamp) / 1000).toFixed(1);
    logger.info(`Committed ${summary} in ${commitDuration} seconds.`);
  }

  return { markReadComplete };
}
