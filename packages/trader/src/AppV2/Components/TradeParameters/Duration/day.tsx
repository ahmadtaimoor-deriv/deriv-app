import { ActionSheet, CaptionText, Text, TextField } from '@deriv-com/quill-ui';
import { LabelPairedCalendarSmRegularIcon, LabelPairedClockThreeSmRegularIcon } from '@deriv/quill-icons';
import { Localize } from '@deriv/translations';
import React from 'react';

import DaysDatepicker from './datepicker';
import EndTimePicker from './timepicker';

const DayInput = ({
    setEndTime,
    setEndDate,
    end_date,
    end_time,
}: {
    setEndTime: (arg: string) => void;
    setEndDate: (arg: Date) => void;
    end_date: Date;
    end_time: string;
}) => {
    const [open, setOpen] = React.useState(false);
    const [open_timepicker, setOpenTimePicker] = React.useState(false);

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

    return (
        <div className='duration-container__days-input'>
            <TextField
                variant='fill'
                readOnly
                textAlignment='center'
                value={formatted_date}
                onClick={() => {
                    setOpen(true);
                }}
                leftIcon={<LabelPairedCalendarSmRegularIcon />}
            />

            <TextField
                variant='fill'
                readOnly
                textAlignment='center'
                value={formatted_date !== formatted_current_date || !end_time ? '12:59:59 GMT' : end_time}
                disabled={formatted_date !== formatted_current_date}
                onClick={() => {
                    setOpenTimePicker(true);
                }}
                leftIcon={<LabelPairedClockThreeSmRegularIcon />}
            />

            <div className='duration-container__days-input__expiry'>
                <CaptionText color='quill-typography__color--subtle'>
                    <Localize i18n_default_text='Expiry' />
                </CaptionText>
                <Text size='sm'>{`${formatted_date} ${end_time || '12:59:59'} GMT`}</Text>
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
                    <ActionSheet.Header title={<Localize i18n_default_text='Pick an end date' />} />
                    {open && <DaysDatepicker end_date={end_date} setEndDate={setEndDate} />}
                    {open_timepicker && <EndTimePicker setEndTime={setEndTime} />}
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
