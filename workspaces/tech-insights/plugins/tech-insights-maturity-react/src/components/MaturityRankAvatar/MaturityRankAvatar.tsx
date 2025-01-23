/*
 * Copyright 2025 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import {
  MaturityProgress,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { Circle } from 'rc-progress';
import React from 'react';
import getRankImg from '../../../../tech-insights-maturity/src/helpers/Rank';
import { getNextRankColor, pluralize } from '../../utils';
import { MaturityLink } from '@backstage-community/plugin-tech-insights-maturity-react';

const ChipWrapper = ({
  children,
  rank,
  size,
  isMaxRank,
}: {
  children: React.JSX.Element;
  rank: Rank;
  size: number;
  isMaxRank?: boolean;
}) => {
  let backgroundColor;
  if (isMaxRank) {
    backgroundColor = 'rgb(35, 180, 70, 1)';
  }

  return (
    <Chip
      avatar={children}
      label={Rank[rank]}
      style={{
        height: size + 7,
        backgroundColor,
        margin: '0',
      }}
      clickable
    />
  );
};

/**
 * Properties for the MaturityRankAvatar component
 *
 * @public
 */
export type MaturityRankAvatarProps = {
  /** The rank value and max rank status */
  value: { rank: Rank; isMaxRank?: boolean };
  /** Optional CSS class name */
  className?: string;
  /** Optional entity reference */
  entity?: Entity;
  /** Size of the avatar in pixels */
  size?: number;
  /** Optional progress information */
  progress?: MaturityProgress;
  /** Optional display variant */
  variant?: 'chip';
};

/**
 * Component that displays a maturity rank as an avatar with optional progress indicator
 *
 * @public
 */
export const MaturityRankAvatar = ({
  className,
  entity,
  progress,
  size = 27,
  value,
  variant,
}: MaturityRankAvatarProps) => {
  let result;
  const rank = value.rank;
  const maxRank = value.isMaxRank ? value.rank : Rank.Gold;

  const img = getRankImg(rank);

  // Define base Avatar element
  result = (
    <Avatar
      alt={Rank[rank]}
      src={img}
      className={className}
      style={{ width: size, height: size }}
    />
  );

  let tooltip = '';

  // Wrap Avatar with a progress indicator if provided
  if (progress !== undefined) {
    const remainingTasks = progress.totalChecks - progress.passedChecks;
    const remainingTasksTip = `(${remainingTasks} task${pluralize(
      remainingTasks,
    )} left)`;
    tooltip = value.isMaxRank
      ? `${Rank[rank]} rank acquired`
      : `${progress.percentage}% to ${Rank[rank + 1]} ${remainingTasksTip}`;

    result = (
      <div
        style={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Circle
          strokeColor={getNextRankColor(rank, maxRank)}
          trailColor="rgba(0, 0, 0, 0.1)"
          strokeWidth={14}
          trailWidth={14}
          percent={progress.percentage}
          style={{ width: size + size / 4, height: size + size / 4 }}
        />
        <div style={{ zIndex: 1, position: 'absolute' }}>{result}</div>
      </div>
    );
  } else {
    tooltip = Rank[rank];
  }

  // Wrap Avatar in Chip if specified
  if (variant === 'chip') {
    tooltip = value.isMaxRank
      ? 'All required tasks have been completed!'
      : `Increase your rank by completing all ${Rank[rank + 1]} rank tasks!`;

    result = (
      <ChipWrapper rank={rank} size={size} isMaxRank={value.isMaxRank}>
        {result}
      </ChipWrapper>
    );
  }

  // Wrap with Entity link if Entity is provided
  if (entity !== undefined) {
    result = (
      <div>
        <MaturityLink entity={entity}>{result}</MaturityLink>
      </div>
    );
  }

  // Wrap with tooltip and return
  return (
    <Tooltip title={tooltip} arrow>
      {result}
    </Tooltip>
  );
};
