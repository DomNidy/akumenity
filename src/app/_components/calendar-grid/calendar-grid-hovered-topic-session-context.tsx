import { createContext, useState, useContext } from "react";

export type HoveredCalendarItemContextType = {
  hoveredCalendarItemId: string | null;
  setHoveredCalendarItemId(hoveredItemId: string | null): void;
};

// Create a new context for hoveredCalendarItem
export const HoveredCalendarItemContext =
  createContext<HoveredCalendarItemContextType>({
    hoveredCalendarItemId: null,
    setHoveredCalendarItemId: () => {
      throw new Error("setHoveredCalendarItemId() not implemented");
    },
  });

// Create a provider for this context
export const HoveredCalendarItemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [hoveredCalendarItemId, setHoveredCalendarItemId] = useState<
    string | null
  >(null);

  return (
    <HoveredCalendarItemContext.Provider
      value={{
        hoveredCalendarItemId,
        setHoveredCalendarItemId,
      }}
    >
      {children}
    </HoveredCalendarItemContext.Provider>
  );
};

// Create a custom hook to use this context
export const useHoveredCalendarItem = () => {
  return useContext(HoveredCalendarItemContext);
};
