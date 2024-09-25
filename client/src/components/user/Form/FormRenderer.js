// FormRenderer.js
import React from "react";
import BaseForm from "./BaseForm";
import SaucesForm from "./SaucesForm";
import SideForm from "./SideForm";
import SupProtForm from "./SupProtForm";

const FormRenderer = ({ type, options, handlers }) => {
  const {
    selectedBase,
    selectedSauces,
    selectedProtSup,
    addSideCounts,
    isSauceDisabled,
    isProtDisabled,
  } = options;
  const {
    handleBaseChange,
    handleSauceChange,
    handleProtSupChange,
    handleSideChange,
  } = handlers;
  return (
    <>
      {(type === "bowl" || type === "custom") && (
        <BaseForm
          selectedBase={selectedBase}
          handleBaseChange={handleBaseChange}
        />
      )}
      {(type === "bowl" || type === "custom" || type === "side") && (
        <SaucesForm
          selectedSauces={selectedSauces}
          handleSauceChange={handleSauceChange}
          isSauceDisabled={isSauceDisabled}
        />
      )}
      {(type === "bowl" || type === "custom") && (
        <SideForm
          handleSideChange={handleSideChange}
          addSideCounts={addSideCounts}
        />
      )}
      {(type === "bowl" || type === "custom") && (
        <SupProtForm
          handleProtSupChange={handleProtSupChange}
          isProtDisabled={isProtDisabled}
          selectedProtSup={selectedProtSup}
        />
      )}
    </>
  );
};

export default FormRenderer;
