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

/**
 * KubeVirt API
 * This is KubeVirt API an add-on for Kubernetes.
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: kubevirt-dev@googlegroups.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { V1ListMeta } from './V1ListMeta';
import { V1StatusDetails } from './V1StatusDetails';

/**
 * Status is a return value for calls that don\'t return other objects.
 * @export
 * @interface V1Status
 */
export interface V1Status {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/api-conventions.md#resources
   * @type {string}
   * @memberof V1Status
   */
  apiVersion?: string;
  /**
   * Suggested HTTP return code for this status, 0 if not set.
   * @type {number}
   * @memberof V1Status
   */
  code?: number;
  /**
   *
   * @type {V1StatusDetails}
   * @memberof V1Status
   */
  details?: V1StatusDetails;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/api-conventions.md#types-kinds
   * @type {string}
   * @memberof V1Status
   */
  kind?: string;
  /**
   * A human-readable description of the status of this operation.
   * @type {string}
   * @memberof V1Status
   */
  message?: string;
  /**
   *
   * @type {V1ListMeta}
   * @memberof V1Status
   */
  metadata?: V1ListMeta;
  /**
   * A machine-readable description of why this operation is in the \"Failure\" status. If this value is empty there is no information available. A Reason clarifies an HTTP status code but does not override it.
   * @type {string}
   * @memberof V1Status
   */
  reason?: string;
  /**
   * Status of the operation. One of: \"Success\" or \"Failure\". More info: https://git.k8s.io/community/contributors/devel/api-conventions.md#spec-and-status
   * @type {string}
   * @memberof V1Status
   */
  status?: string;
}
