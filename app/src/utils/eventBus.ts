type Handler<T = unknown> = (data: T) => void

class EventBus {
  private listeners = new Map<string, Set<Handler>>()

  subscribe<T>(topic: string, handler: Handler<T>): void {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set())
    }
    this.listeners.get(topic)!.add(handler as Handler)
  }

  unsubscribe<T>(topic: string, handler: Handler<T>): void {
    this.listeners.get(topic)?.delete(handler as Handler)
  }

  emit<T>(topic: string, data: T): void {
    this.listeners.get(topic)?.forEach(h => h(data))
  }

  subscriberCount(topic: string): number {
    return this.listeners.get(topic)?.size ?? 0
  }
}

export const eventBus = new EventBus()
