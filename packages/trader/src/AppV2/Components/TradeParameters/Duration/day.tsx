import { ActionSheet, Text, TextField } from '@deriv-com/quill-ui';
import { LabelPairedCalendarSmRegularIcon, LabelPairedClockThreeSmRegularIcon } from '@deriv/quill-icons';
import { Localize } from '@deriv/translations';
import React, { useEffect } from 'react';

import DaysDatepicker from './datepicker';
import EndTimePicker from './timepicker';
import { useStore } from '@deriv/stores';
import { useTraderStore } from 'Stores/useTraderStores';
import { hasIntradayDurationUnit, isTimeValid, setTime, toMoment } from '@deriv/shared';
import { getBoundaries } from 'Stores/Modules/Trading/Helpers/end-time';
import { getClosestTimeToCurrentGMT } from 'AppV2/Utils/trade-params-utils';
import { Moment } from 'moment';

const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

export const toDate = (value: string | number | Date | Moment): Date => {
    if (!value) return new Date();

    if (value instanceof Date && !isNaN(value.getTime())) {
        return value;
    }

    if (typeof value === 'number') {
        return new Date(value * 1000);
    }

    const parsedDate = new Date(value as Date);
    if (isNaN(parsedDate.getTime())) {
        const today = new Date();
        const daysInMonth = new Date(today.getUTCFullYear(), today.getUTCMonth() + 1, 0).getDate();
        const valueAsNumber = Date.parse(value as string) / (1000 * 60 * 60 * 24);
        return valueAsNumber > daysInMonth
            ? new Date(today.setUTCDate(today.getUTCDate() + Number(value)))
            : new Date(value as Date);
    }

    return parsedDate;
};

export const setMinTime = (dateObj: Date, time?: string) => {
    const [hour, minute, second] = time ? time.split(':') : [0, 0, 0];
    dateObj?.setHours(Number(hour));
    dateObj?.setMinutes(Number(minute) || 0);
    dateObj?.setSeconds(Number(second) || 0);
    return dateObj;
};

const DayInput = ({
    setEndTime,
    setEndDate,
    end_date,
    end_time,
    expiry_time_string,
}: {
    setEndTime: (arg: string) => void;
    setEndDate: (arg: Date) => void;
    end_date: Date;
    end_time: string;
    expiry_time_string: string;
}) => {
    const [current_gmt_time, setCurrentGmtTime] = React.useState<string>('');
    const [open, setOpen] = React.useState(false);
    const [open_timepicker, setOpenTimePicker] = React.useState(false);
    const { common } = useStore();
    const { server_time } = common;
    const {
        expiry_date,
        market_open_times,
        market_close_times,
        duration_units_list,
        start_date,
        start_time,
        duration_min_max,
    } = useTraderStore();

    const moment_expiry_date = toMoment(expiry_date);
    const market_open_datetimes = market_open_times.map(open_time => setTime(moment_expiry_date.clone(), open_time));
    const market_close_datetimes = market_close_times.map(close_time =>
        setTime(moment_expiry_date.clone(), close_time)
    );
    const server_datetime = toMoment(server_time);
    const boundaries = getBoundaries(server_datetime.clone(), market_open_datetimes, market_close_datetimes);
    const adjusted_start_time =
        boundaries.start[0]?.clone().add(5, 'minutes').format('HH:mm') || getClosestTimeToCurrentGMT(5);

    const formatted_date = end_date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const formatted_current_date = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    React.useEffect(() => {
        const updateCurrentGmtTime = () => {
            const now = new Date();
            const gmt_time = now.toLocaleTimeString('en-GB', { timeZone: 'GMT', hour12: false });
            setCurrentGmtTime(gmt_time);
        };
        updateCurrentGmtTime();
        const interval = setInterval(updateCurrentGmtTime, 1000);
        if (end_time !== '' && Math.abs(timeToMinutes(adjusted_start_time) - timeToMinutes(end_time)) === 5) {
            setEndTime(adjusted_start_time);
        }
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [end_time, adjusted_start_time]);

    useEffect(() => {
        if (formatted_date === formatted_current_date && !end_time) {
            setEndTime(adjusted_start_time);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [end_date]);

    let is_24_hours_contract = false;

    const has_intraday_duration_unit = hasIntradayDurationUnit(duration_units_list);
    is_24_hours_contract =
        (!!start_date || toMoment(expiry_date || server_time).isSame(toMoment(server_time), 'day')) &&
        has_intraday_duration_unit;

    const getMomentContractStartDateTime = () => {
        const minDurationDate = getMinDuration();
        const time = isTimeValid(start_time ?? '') ? start_time : server_time?.toISOString().substr(11, 8) ?? '';
        return setMinTime(minDurationDate, time ?? '');
    };

    const getMinDuration = () => {
        const server_date = toDate(server_time);
        return hasIntradayDurationUnit(duration_units_list)
            ? new Date(server_date)
            : new Date(server_date.getTime() + (duration_min_max?.daily?.min || 0) * 1000);
    };

    const getMinDateExpiry = () => {
        const min_date = new Date(getMomentContractStartDateTime());
        return min_date;
    };

    return (
        <div className='duration-container__days-input'>
            <TextField
                variant='fill'
                readOnly
                name='date'
                data-testid='dt_date_input'
                textAlignment='center'
                value={formatted_date}
                onClick={() => {
                    setOpen(true);
                }}
                leftIcon={<LabelPairedCalendarSmRegularIcon width={24} height={24} />}
            />

            <TextField
                variant='fill'
                readOnly
                textAlignment='center'
                name='time'
                value={`${(is_24_hours_contract ? end_time : expiry_time_string) || '23:59:59'} GMT+0`}
                disabled={formatted_date !== formatted_current_date || !is_24_hours_contract}
                onClick={() => {
                    setOpenTimePicker(true);
                }}
                leftIcon={<LabelPairedClockThreeSmRegularIcon width={24} height={24} />}
            />

            <div className='duration-container__days-input__expiry'>
                <Text size='sm' color='quill-typography__color--subtle'>
                    <Localize i18n_default_text='Expiry' />
                </Text>
                <Text size='sm'>{`
                ${formatted_date} ${(is_24_hours_contract ? end_time : expiry_time_string) || '23:59:59'} GMT+0`}</Text>
            </div>
            <ActionSheet.Root
                isOpen={open || open_timepicker}
                onClose={() => {
                    setOpen(false);
                    setOpenTimePicker(false);
                }}
                position='left'
                expandable={false}
            >
                <ActionSheet.Portal shouldCloseOnDrag>
                    <ActionSheet.Header
                        title={
                            open ? (
                                <Localize i18n_default_text='Pick an end date' />
                            ) : (
                                <Localize i18n_default_text='Pick an end time' />
                            )
                        }
                    />
                    {open && (
                        <DaysDatepicker start_date={getMinDateExpiry()} end_date={end_date} setEndDate={setEndDate} />
                    )}
                    {open_timepicker && (
                        <EndTimePicker
                            setEndTime={setEndTime}
                            end_time={end_time}
                            current_gmt_time={current_gmt_time}
                            adjusted_start_time={adjusted_start_time}
                        />
                    )}
                    <ActionSheet.Footer
                        alignment='vertical'
                        shouldCloseOnPrimaryButtonClick={false}
                        primaryAction={{
                            content: <Localize i18n_default_text='Done' />,
                            onAction: () => {
                                setOpen(false);
                                setOpenTimePicker(false);
                                if (formatted_date !== formatted_current_date) {
                                    setEndTime('');
                                }
                            },
                        }}
                    />
                </ActionSheet.Portal>
            </ActionSheet.Root>
        </div>
    );
};

export default DayInput;
