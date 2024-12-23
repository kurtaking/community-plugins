## API Report File for "@backstage-community/plugin-jaeger-common"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
// @public (undocumented)
export const JAEGER_LIMIT_ANNOTATION = 'jaegertracing.io/limit';

// @public (undocumented)
export const JAEGER_LOOKBACK_ANNOTATION = 'jaegertracing.io/lookback';

// @public (undocumented)
export const JAEGER_OPERATION_ANNOTATION = 'jaegertracing.io/operation';

// @public (undocumented)
export const JAEGER_SERVICE_ANNOTATION = 'jaegertracing.io/service';

// @public (undocumented)
export type KeyValuePair<ValueType = string> = {
  key: string;
  value: ValueType;
};

// @public (undocumented)
export type Process = {
  serviceName: string;
  tags: Array<KeyValuePair>;
};

// @public (undocumented)
export type Span = {
  traceID: string;
  spanID: string;
  operationName: string;
  references: any[];
  startTime: number;
  duration: number;
  processID: string;
};

// @public (undocumented)
export type Trace = {
  traceID: string;
  spans: Span[];
  processes: Record<string, Process>;
};

// (No @packageDocumentation comment for this package)
```