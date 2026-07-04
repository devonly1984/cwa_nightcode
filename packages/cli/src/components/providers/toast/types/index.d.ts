export type ToastVariant = 'success' | 'error' | 'info'

export type ToastOptions = {
    message:string;
    variant?:ToastVariant;
    duration?:number;
}
export type ToastContextValue = {
    show: (options: ToastOptions) => void;
}