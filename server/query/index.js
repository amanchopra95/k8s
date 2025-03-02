import otel, { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { ConsoleSpanExporter, Span } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  AggregationTemporality
} from '@opentelemetry/sdk-metrics'
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray';
import {SemanticResourceAttributes} from "@opentelemetry/semantic-conventions";
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "query",
    [SemanticResourceAttributes.SERVICE_VERSION]: "0.0.1",
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: "development"
  })
);


const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    url: `http://groundcover-sensor.groundcover.svc.cluster.local:4318/v1/metrics`,
    compression: CompressionAlgorithm.GZIP,
    temporalityPreference: AggregationTemporality.DELTA,
  }),
});

const tracingExporter = new OTLPTraceExporter({
  url: `http://groundcover-sensor.groundcover.svc.cluster.local:4318/v1/traces`,
  compression: CompressionAlgorithm.GZIP,
});

const spanProcessor = new BatchSpanProcessor(tracingExporter, {
  maxExportBatchSize: 1000,
  maxQueueSize: 1000,
});

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
  spanProcessor,
  resource,
  metricReader,
  idGenerator: new AWSXRayIdGenerator(),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        applyCustomAttributesOnSpan: (span, request, response) => {
         // Just for testing
          totalHttpRequestCount.add(1, {environment: "development"})
        }
      }
    })
  ]
})

sdk.start();

const meter = otel.metrics.getMeter("query");
const queryCounter = meter.createCounter("query.counter",{
    description: "Posts counter"
});

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const posts = {}

const app = express()
app.use(bodyParser.json())
app.use(cors())

const handleEvent = (type, data) => {
    if (type === "POSTCREATED") {
        const { id, title } = data
        posts[id] = { id, title, comments: [] }
    } 
    
    if (type === "COMMENTCREATED") {

        const { postId, id, content, status } = data
        const post = posts[postId]
        if (post) {
            post.comments.push({ id, content, status })
        }
    }

    if (type === "CommentUpdated") {
        const { postId, id, content, status } = data
        const post = posts[postId]
        if (post) {
            const comment = post.comments.find(comment => comment.id === id)
            comment.status = status
            comment.content = content
        }
    }
}

app.get('/posts', (req, res) => {
    queryCounter.add(1, {environment: "development"});
    res.send(posts)
})

app.post('/events', (req,res) => {
    const { type, data } = req.body

    handleEvent(type, data);
    res.send({})
})

app.listen(4002, async () => {
    console.log('Listening on PORT 4002')

    const res = await axios.get('http://event-bus-srv:4005/events')

    for (let event of res.data) {
        console.log("Processing event ", event.type)

        handleEvent(event.type, event.data)
    }
    

})
