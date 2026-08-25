import React, { useEffect, useMemo, useRef, useState } from 'react';
import './ProfileChipMultiSelect.css';

const normalizeTokens = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

export default function ProfileChipMultiSelect({
  id,
  options = [],
  value = [],
  onChange,
  placeholder = 'Select...',
  emptyRecordMsg = 'No options found',
  selectionLimit,
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedIds = useMemo(() => normalizeTokens(value), [value]);

  const selectedOptions = useMemo(
    () =>
      selectedIds
        .map((token) => {
          const byId = options.find((o) => o.id === token);
          if (byId) return byId;
          const byName = options.find(
            (o) => o.name.toLowerCase() === token.toLowerCase()
          );
          return byName || { id: token, name: token };
        })
        .filter(Boolean),
    [selectedIds, options]
  );

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.name.toLowerCase().includes(q) ||
        String(option.id).toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const commit = (nextIds) => {
    const limited =
      typeof selectionLimit === 'number' && selectionLimit > 0
        ? nextIds.slice(0, selectionLimit)
        : nextIds;
    onChange(limited);
  };

  const toggleOption = (optionId) => {
    if (selectedIds.includes(optionId)) {
      commit(selectedIds.filter((id) => id !== optionId));
      return;
    }
    if (
      typeof selectionLimit === 'number' &&
      selectionLimit > 0 &&
      selectedIds.length >= selectionLimit
    ) {
      return;
    }
    commit([...selectedIds, optionId]);
  };

  const removeOption = (optionId) => {
    commit(selectedIds.filter((id) => id !== optionId));
  };

  return (
    <div id={id} ref={rootRef} className={`profile-chip-ms${open ? ' is-open' : ''}`}>
      <div
        className="profile-chip-ms__control"
        onClick={() => setOpen(true)}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
      >
        {selectedOptions.length > 0 ? (
          <div className="profile-chip-ms__chips">
            {selectedOptions.map((option) => (
              <span key={option.id} className="profile-chip-ms__chip">
                {option.name}
                <button
                  type="button"
                  className="profile-chip-ms__chip-remove"
                  aria-label={`Remove ${option.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeOption(option.id);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <input
          type="text"
          className="profile-chip-ms__input"
          value={query}
          placeholder={selectedOptions.length ? '' : placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (filteredOptions[0]) {
                toggleOption(filteredOptions[0].id);
                setQuery('');
              }
            }
            if (event.key === 'Escape') {
              setOpen(false);
              setQuery('');
            }
          }}
          autoComplete="off"
        />
      </div>

      {open && (
        <div className="profile-chip-ms__dropdown" id={`${id}-listbox`} role="listbox">
          {filteredOptions.length === 0 ? (
            <div className="profile-chip-ms__empty">{emptyRecordMsg}</div>
          ) : (
            filteredOptions.map((option) => {
              const checked = selectedIds.includes(option.id);
              const disabled =
                !checked &&
                typeof selectionLimit === 'number' &&
                selectionLimit > 0 &&
                selectedIds.length >= selectionLimit;

              return (
                <label
                  key={option.id}
                  className={`profile-chip-ms__option${checked ? ' is-selected' : ''}${
                    disabled ? ' is-disabled' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleOption(option.id)}
                  />
                  <span>{option.name}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
