export type Responder = () => boolean;

export type KeyboardLayerContextValue = {
    push:(id:string,responder?:Responder)=>void;
    pop: (id:string)=>void;
    isTopLayer:(id:string)=>boolean;
    setResponder: (id: string, responder: Responder | null) => void;
}