// BullMQ (v5) não aceita ':' no nome da fila; usamos underscores.
export const CLIPFORGE_QUEUES = {
  SCRIPT_GENERATE: 'clipforge_script_generate',
  TTS_GENERATE: 'clipforge_tts_generate',
  VIDEO_RENDER: 'clipforge_video_render',
  POST_QUEUE: 'clipforge_post_queue',
  METRICS_PULL: 'clipforge_metrics_pull',
  DEADLETTER: 'clipforge_deadletter',
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
