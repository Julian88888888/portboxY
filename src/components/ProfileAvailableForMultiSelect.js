import React from 'react';
import Multiselect from 'multiselect-react-dropdown';
import {
  PROFILE_AVAILABLE_FOR_OPTIONS,
  parseAvailableForSelections,
  formatAvailableForSelections,
} from '../utils/availableFor';
import './ProfileAvailableForMultiSelect.css';

const MULTISELECT_STYLES = {
  multiselectContainer: {
    width: '100%',
  },
  searchBox: {
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '8px 10px',
    fontSize: '13px',
    marginBottom: '8px',
  },
  inputField: {
    fontSize: '13px',
    margin: '0',
    padding: '0',
  },
  optionContainer: {
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    backgroundColor: '#fff',
    maxHeight: '220px',
  },
  option: {
    fontSize: '13px',
    padding: '10px 12px',
    color: '#374151',
  },
  chips: {
    background: '#783FF3',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '999px',
    padding: '4px 10px',
  },
  highlightOption: {
    backgroundColor: '#f3e8ff',
    color: '#4c1d95',
  },
};

export default function ProfileAvailableForMultiSelect({ id, value, onChange, selectionLimit = 6 }) {
  const selectedValues = parseAvailableForSelections(value);

  const handleChange = (selectedList) => {
    onChange(formatAvailableForSelections(selectedList));
  };

  return (
    <div id={id} className="profile-available-for-multiselect">
      <Multiselect
        options={PROFILE_AVAILABLE_FOR_OPTIONS}
        selectedValues={selectedValues}
        onSelect={handleChange}
        onRemove={handleChange}
        isObject={false}
        showCheckbox
        showArrow
        avoidHighlightFirstOption
        selectionLimit={selectionLimit}
        placeholder="Select categories"
        emptyRecordMsg="No categories found"
        disablePreSelectedValues={false}
        style={MULTISELECT_STYLES}
      />
    </div>
  );
}
