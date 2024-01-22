const providers = Symbol();

export function provide(token) {
  return (target, property) => {
    target[providers] ||= [];
    
  }
}

export function inject(token) {

}