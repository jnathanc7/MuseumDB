import { useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes

const CustomSelect = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false); // Track dropdown visibility

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev); // Toggle dropdown visibility
  };

  const handleOptionSelect = (selectedValue) => {
    onChange(selectedValue); // Update the selected value

    setIsOpen(false); // Close the dropdown after selection
  };

  return (
    <div className="custom-select">
      <label>{label}</label>

      <div className="selected-option" onClick={toggleDropdown}>
        {options.find((option) => option.value === value)?.icon}

        {options.find((option) => option.value === value)?.label}
      </div>

      {isOpen && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div
              key={option.value}
              className="dropdown-option"
              onClick={() => handleOptionSelect(option.value)}
            >
              {option.icon}

              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

CustomSelect.propTypes = {
  value: PropTypes.string.isRequired,

  onChange: PropTypes.func.isRequired,

  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,

      label: PropTypes.string.isRequired,

      icon: PropTypes.node.isRequired,
    })
  ).isRequired,

  label: PropTypes.string,
};
