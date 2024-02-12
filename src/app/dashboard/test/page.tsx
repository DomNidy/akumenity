"use client";
import { CalendarPopupForm } from "~/app/_components/calendar-grid/popup/calendar-popup-form";

export default function TestPage() {
  return (
    <CalendarPopupForm
      clickPos={{
        calendarTimeMS: 1707926400939,
        x: 10,
        y: 10,
        event: {
          clientX: 10,
          clientY: 10,
          altKey: false,
          button: 0,
          buttons: 0,
          ctrlKey: false,
          metaKey: false,
          movementX: 0,
          movementY: 0,
          offsetX: 0,
          offsetY: 0,
          pageX: 0,
          pageY: 0,
          relatedTarget: null,
          screenX: 0,
          screenY: 0,
          shiftKey: false,
          x: 0,
          y: 0,
          getModifierState: function (keyArg: string): boolean {
            throw new Error("Function not implemented.");
          },
          initMouseEvent: function (
            typeArg: string,
            canBubbleArg: boolean,
            cancelableArg: boolean,
            viewArg: Window,
            detailArg: number,
            screenXArg: number,
            screenYArg: number,
            clientXArg: number,
            clientYArg: number,
            ctrlKeyArg: boolean,
            altKeyArg: boolean,
            shiftKeyArg: boolean,
            metaKeyArg: boolean,
            buttonArg: number,
            relatedTargetArg: EventTarget | null,
          ): void {
            throw new Error("Function not implemented.");
          },
          detail: 0,
          view: null,
          which: 0,
          initUIEvent: function (
            typeArg: string,
            bubblesArg?: boolean | undefined,
            cancelableArg?: boolean | undefined,
            viewArg?: Window | null | undefined,
            detailArg?: number | undefined,
          ): void {
            throw new Error("Function not implemented.");
          },
          bubbles: false,
          cancelBubble: false,
          cancelable: false,
          composed: false,
          currentTarget: null,
          defaultPrevented: false,
          eventPhase: 0,
          isTrusted: false,
          returnValue: false,
          srcElement: null,
          target: null,
          timeStamp: 0,
          type: "",
          composedPath: function (): EventTarget[] {
            throw new Error("Function not implemented.");
          },
          initEvent: function (
            type: string,
            bubbles?: boolean | undefined,
            cancelable?: boolean | undefined,
          ): void {
            throw new Error("Function not implemented.");
          },
          preventDefault: function (): void {
            throw new Error("Function not implemented.");
          },
          stopImmediatePropagation: function (): void {
            throw new Error("Function not implemented.");
          },
          stopPropagation: function (): void {
            throw new Error("Function not implemented.");
          },
          NONE: 0,
          CAPTURING_PHASE: 1,
          AT_TARGET: 2,
          BUBBLING_PHASE: 3,
        },
      }}
    />
  );
}
