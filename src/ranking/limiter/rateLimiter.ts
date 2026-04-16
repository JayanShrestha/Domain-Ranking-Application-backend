// rateLimiter.ts
type Job<T> = {
  fn: () => Promise<T>;
  resolve: (v: T) => void;
  reject: (e: any) => void;
};

export class RateLimiterQueue {
  private queue: Job<any>[] = [];
  private running = false;

  constructor(private intervalMs = 1500) {} // 1 request per 1.5 second

  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      if (!this.running) this.start();
    });
  }

  private start() {
    this.running = true;

    const tick = async () => {
      const job = this.queue.shift();
      if (!job) {
        this.running = false;
        return;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await job.fn();
        job.resolve(result);
      } catch (err) {
        job.reject(err);
      } finally {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setTimeout(tick, this.intervalMs);
      }
    };

    void tick();
  }
}
