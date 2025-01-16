import React from 'react';

interface DropdownProps {
  options: string[]; // Array of dropdown options
  value: string; // Current selected value
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; // Change handler
  label: string; // Label for the dropdown
  id: string; // ID for the dropdown
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, label, id }) => {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={onChange}>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
