import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    color?: string;
}

interface MultiSelectProps {
    label: string;
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    label,
    options,
    selected,
    onChange,
    placeholder = 'Select...',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(v => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const clearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    const selectedLabels = options
        .filter(o => selected.includes(o.value))
        .map(o => o.label);

    return (
        <div ref={containerRef} className="relative">
            <label className="label">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full flex items-center justify-between px-3 py-2 
          bg-white border rounded-lg text-left text-sm
          transition-all duration-200
          ${isOpen
                        ? 'border-primary-500 ring-2 ring-primary-500/20'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }
        `}
            >
                <span className={selected.length === 0 ? 'text-neutral-400' : 'text-neutral-900'}>
                    {selected.length === 0
                        ? placeholder
                        : selected.length === options.length
                            ? 'All selected'
                            : selectedLabels.slice(0, 2).join(', ') +
                            (selected.length > 2 ? ` +${selected.length - 2}` : '')
                    }
                </span>
                <div className="flex items-center gap-1">
                    {selected.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="p-1 hover:bg-neutral-100 rounded transition-colors"
                        >
                            <X className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-elevated animate-fade-in">
                    <div className="max-h-60 overflow-auto scrollbar-thin">
                        {options.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleOption(option.value)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 transition-colors"
                            >
                                <div className={`
                  w-4 h-4 rounded border flex items-center justify-center transition-colors
                  ${selected.includes(option.value)
                                        ? 'bg-primary-600 border-primary-600'
                                        : 'border-neutral-300'
                                    }
                `}>
                                    {selected.includes(option.value) && (
                                        <Check className="w-3 h-3 text-white" />
                                    )}
                                </div>
                                {option.color && (
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: option.color }}
                                    />
                                )}
                                <span className="text-sm text-neutral-700">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
