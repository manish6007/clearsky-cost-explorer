import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
    from: string;
    to: string;
    onChange: (from: string, to: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    from,
    to,
    onChange,
}) => {
    return (
        <div>
            <label className="label">Date Range</label>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => onChange(e.target.value, to)}
                        className="pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       bg-white"
                    />
                </div>
                <span className="text-neutral-400">to</span>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => onChange(from, e.target.value)}
                        className="pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       bg-white"
                    />
                </div>
            </div>
        </div>
    );
};

export default DateRangePicker;
