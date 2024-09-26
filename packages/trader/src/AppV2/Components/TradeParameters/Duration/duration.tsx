import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react';
import { ActionSheet, TextField } from '@deriv-com/quill-ui';
import { getUnitMap } from '@deriv/shared';
import { Localize, localize } from '@deriv/translations';
import { useTraderStore } from 'Stores/useTraderStores';
import DurationActionSheetContainer from './container';
import { getDisplayedContractTypes } from 'AppV2/Utils/trade-types-utils';

type TDurationProps = {
    is_minimized?: boolean;
};

const Duration = observer(({ is_minimized }: TDurationProps) => {
    const {
        duration,
        duration_unit,
        expiry_time,
        expiry_type,
        contract_type,
        trade_types,
        proposal_info,
        trade_type_tab,
    } = useTraderStore();

    const { name_plural, name } = getUnitMap()[duration_unit] ?? {};
    const duration_unit_text = name_plural ?? name;
    const [selected_hour, setSelectedHour] = useState<number[]>([]);
    const [is_open, setOpen] = useState(false);
    const [end_date, setEndDate] = useState<Date>(new Date());
    const [unit, setUnit] = useState(expiry_time ? 'd' : duration_unit);

    useEffect(() => {
        if (duration_unit == 'd') {
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + duration);
            setEndDate(newDate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration_unit]);

    const handleHour = React.useCallback(() => {
        if (expiry_time) {
            setUnit('et');
        } else {
            // eslint-disable-next-line no-lonely-if
            if (duration_unit === 'm' && duration > 59) {
                const hour = Math.floor(duration / 60);
                const minutes = duration % 60;
                setUnit('h');
                setSelectedHour([hour, minutes]);
            } else {
                setSelectedHour([]);
                setUnit(duration_unit);
            }
        }
    }, [duration, duration_unit, expiry_time]);

    useEffect(() => {
        handleHour();
    }, [handleHour, is_open]);

    const getInputValues = () => {
        const formatted_date = end_date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        if (expiry_type == 'duration') {
            if (duration_unit === 'm' && duration > 59) {
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                return `${hours} ${localize('hours')} ${minutes ? `${minutes} ${localize('minutes')}` : ''} `;
            } else if (duration_unit === 'd') {
                return `${localize('Ends on')} ${formatted_date}, 23:59:59 GMT`;
            }
            return `${duration} ${duration_unit_text}`;
        }
        if (expiry_time) {
            return `${localize('Ends on')} ${formatted_date} ${expiry_time} GMT`;
        }
        return '';
    };

    const contract_type_object = getDisplayedContractTypes(trade_types, contract_type, trade_type_tab);
    const has_error = proposal_info[contract_type_object[0]]?.has_error;

    return (
        <>
            <TextField
                variant='fill'
                readOnly
                label={<Localize i18n_default_text='Duration' key={`duration${is_minimized ? '-minimized' : ''}`} />}
                value={getInputValues()}
                noStatusIcon
                className={clsx('trade-params__option', is_minimized && 'trade-params__option--minimized')}
                onClick={() => setOpen(true)}
                status={has_error ? 'error' : 'neutral'}
            />
            <ActionSheet.Root
                isOpen={is_open}
                onClose={() => {
                    setOpen(false);
                }}
                position='left'
                expandable={false}
            >
                <ActionSheet.Portal shouldCloseOnDrag>
                    <DurationActionSheetContainer
                        unit={unit}
                        setUnit={setUnit}
                        setEndDate={setEndDate}
                        end_date={end_date}
                        selected_hour={selected_hour}
                        setSelectedHour={setSelectedHour}
                    />
                </ActionSheet.Portal>
            </ActionSheet.Root>
        </>
    );
});

export default Duration;
