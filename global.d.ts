import { IStaticMethods } from "flyonui/flyonui";

interface IHSOverlay {
  open(target: string): void
  close(target: string): void
}

declare global {
  interface Window {
    HSStaticMethods: IStaticMethods
    HSOverlay: IHSOverlay
  }
}

export {};
