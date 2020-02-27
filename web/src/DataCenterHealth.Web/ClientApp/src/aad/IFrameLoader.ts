export module IFrameLoader {
    let frameWindow: Window;

    export function setCurrentWindow(currentWindow: Window) {
        frameWindow = currentWindow;
    }
    export function getIFrameWindow(): Window {
        return frameWindow;
    }
}
