export const CLIPFORGE_QUEUES = {
  SCRIPT_GENERATE: 'clipforge:script.generate',
  TTS_GENERATE: 'clipforge:tts.generate',
  VIDEO_RENDER: 'clipforge:video.render',
  POST_QUEUE: 'clipforge:post.queue',
  METRICS_PULL: 'clipforge:metrics.pull',
  DEADLETTER: 'clipforge:deadletter',
} as const;

export type ClipforgeQueueName =
  (typeof CLIPFORGE_QUEUES)[keyof typeof CLIPFORGE_QUEUES];

export const CLIPFORGE_QUEUE_LIST: ClipforgeQueueName[] = [
  CLIPFORGE_QUEUES.SCRIPT_GENERATE,
  CLIPFORGE_QUEUES.TTS_GENERATE,
  CLIPFORGE_QUEUES.VIDEO_RENDER,
  CLIPFORGE_QUEUES.POST_QUEUE,
  CLIPFORGE_QUEUES.METRICS_PULL,
  CLIPFORGE_QUEUES.DEADLETTER,
];
