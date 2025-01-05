import { useCallback, useEffect, useState } from "react";

interface DisConnect {
  disconnect: () => void;
}

class Stateful<T> {
  constructor(protected value: T) {}
  private listeners = new Set<(value: any) => void>();
  public subscribe(callback: (value: T) => void): DisConnect {
    this.listeners.add(callback);
    return {
      disconnect: () => {
        this.listeners.delete(callback);
      },
    };
  }
  public snapshot(): T {
    return this.value;
  }
  public emit() {
    console.log("状态更新");
    for (const listener of Array.from(this.listeners)) {
      listener(this.snapshot());
    }
  } 
  protected update(value: T) {
    if (this.value !== value) {
      this.value = value;
      this.emit();
    }
  }
}

class Atom<T> extends Stateful<T> {
  public setState(state: T): void {
    super.update(state);
  }
}

class Selector<T> extends Stateful<T> {
  constructor(readonly generate: SelectorGenerator<T>) {
    super(undefined as any);
   this.value = generate({ get: (dep: Atom<T>) => this.addSubs(dep) });
  }
  private registerDeps = new Set<Atom<T>>();
  private addSubs(dep: Atom<T>) {
    if (!this.registerDeps.has(dep)) {
      dep.subscribe(() => this.updateSelector());
      this.registerDeps.add(dep);
    }
    return dep.snapshot();
  }
    public updateSelector() {
      this.update(this.generate({ get: (dep: Atom<T>) => this.addSubs(dep) }));
  }
  public setState(state: T): void {
    super.update(state);
  }
}


// 基础状态
interface State<V> {
  key: string;
  default: V;
}
export function atom<V>(state: State<V>) {
  return new Atom<V>(state.default);
}

type SelectorGenerator<V> = (context: { get: <T>(dep: Atom<T>) => T }) => V;
// 相当于action  
export function useSelector<V>(value: { key: string; get: SelectorGenerator<V> }) {
  return new Selector<V>(value.get);
}
// 可以改变基础状态
export function useRecoilState<T>(atom: Atom<T>) {
    const value = useRecoilValue(atom);
   return [
     value,
     useCallback((state: T) => atom.setState(state), [atom]),
   ] as const;
}
// 获取基础状态不改变，基础状态改变时重新获取
export function useRecoilValue<T>(value: Stateful<T>) { 
      const [, updateState] = useState({});
      useEffect(() => {
        const { disconnect } = value.subscribe(() => updateState({}));
        return () => disconnect();
      }, [value]);
  return value.snapshot();
}
