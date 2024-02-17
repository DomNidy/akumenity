/* eslint-disable @typescript-eslint/no-unsafe-call */
import { render, screen, createEvent, fireEvent } from "@testing-library/react";
import { clickedInsideElement } from "../calendar-popup-helpers";

describe("clickedInsideElement", () => {
  const Page = () => {
    return (
      <main>
        <div data-testid="target-div">
          <p>Target element</p>
          <div data-testid="target-child-div">
            <p data-testid="target-child-div-p">Nested target element</p>
          </div>
        </div>
        <div data-testid="other-div">
          <p>Some other element</p>
          <div data-testid="other-child-div">
            <p data-testid="other-child-div-p">Nested other element</p>
          </div>
        </div>
      </main>
    );
  };

  test("Returns true if the passed element was the one clicked", () => {
    const page = <Page />;
    render(page);

    // Get the elements by ids
    const targetElement = screen.getByTestId("target-div");

    // Create a click event
    const clickEvent = createEvent.click(targetElement) as MouseEvent;
    fireEvent(targetElement, clickEvent);

    // Run the clickedInsideElement function
    const result = clickedInsideElement(targetElement, clickEvent);

    expect(result).toBe(true);
  });

  test("Returns false if the passed element was not the one clicked", () => {
    const page = <Page />;
    render(page);

    // Get the elements
    const targetElement = screen.getByTestId("target-div");
    const otherElement = screen.getByTestId("other-div");

    // Create a click event
    const clickEvent = createEvent.click(otherElement) as MouseEvent;
    // Fire the click event on the other element
    fireEvent(otherElement, clickEvent);

    // Check if we clicked inside the target element
    const result = clickedInsideElement(targetElement, clickEvent);

    expect(result).toBe(false);
  });

  test("Returns true if the clicked element was a child of the target element", () => {
    const page = <Page />;

    // Render the page
    render(page);

    // Get the elements
    const targetElement = screen.getByTestId("target-div");
    const nestedTargetElement = screen.getByTestId("target-child-div-p");
    // Create a click event
    const clickEvent = createEvent.click(nestedTargetElement) as MouseEvent;
    // Fire the click event on the nested target element
    fireEvent(nestedTargetElement, clickEvent);

    // Check if we clicked inside the target element
    const result = clickedInsideElement(targetElement, clickEvent);

    expect(result).toBe(true);
  });

  test("Returns false if the clicked element was not a child of target element", () => {
    const page = <Page />;
    render(page);

    // Get the elements
    const targetElement = screen.getByTestId("target-div");
    const nestedOtherElement = screen.getByTestId("other-child-div-p");

    // Create a click event
    const clickEvent = createEvent.click(nestedOtherElement) as MouseEvent;
    // Fire the click event on the nested other element
    fireEvent(nestedOtherElement, clickEvent);

    // Check if we clicked inside the target element
    const result = clickedInsideElement(targetElement, clickEvent);

    expect(result).toBe(false);
  });
});

// describe("getLocalXYPosition", () => {
//   const Page = () => {
//     return (
//       <div>
//         <div className="relative h-64 w-32" data-testid="target-div">
//           <h1 className="text-3xl">Header text</h1>
//           <p className="text-lg">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias
//             voluptatem et laborum expedita impedit magni non ab consequuntur
//             eaque tempore obcaecati cupiditate nisi error dolore laudantium,
//             beatae molestias harum similique?
//           </p>
//         </div>
//       </div>
//     );
//   };
//   test("Returns the x and y position of the click event relative to the dom element", () => {
//     const page = <Page />;
//     render(page);

//     const targetElement = screen.getByTestId("target-div");

//     // Click event
//     const clickEvent = createEvent.click(targetElement) as MouseEvent;
//     // Fire the click event on the target element
//     fireEvent(targetElement, clickEvent);

//     const result = getLocalXYPosition({
//       offsetX: clickEvent.offsetX,
//       offsetY: clickEvent.offsetY,
//       clickedElement: targetElement,
//     });

//   });
// });
