import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import DurationActionSheetContainer from '../container';
import { mockStore } from '@deriv/stores';
import { TCoreStores } from '@deriv/stores/types';
import TraderProviders from '../../../../../trader-providers';
import userEvent from '@testing-library/user-event';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

global.ResizeObserver = ResizeObserver;
global.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock('Stores/Modules/Trading/Helpers/contract-type', () => ({
    ContractType: {
        getTradingEvents: jest.fn(),
    },
}));

jest.mock('@deriv-com/quill-ui', () => ({
    ...jest.requireActual('@deriv-com/quill-ui'),
    DatePicker: jest.fn(({ onChange }) => (
        <div>
            <button
                onClick={() => {
                    const mockDate = new Date(2023, 8, 10);
                    onChange(mockDate);
                }}
            >
                Date Picker
            </button>
        </div>
    )),
}));

describe('DurationActionSheetContainer', () => {
    let default_trade_store: TCoreStores;

    beforeEach(() => {
        default_trade_store = mockStore({
            modules: {
                trade: {
                    duration: 30,
                    duration_unit: 'm',
                    duration_units_list: ['t', 'm', 'h', 'd'],
                    onChangeMultiple: jest.fn(),
                    expiry_time: null,
                    contract_type: 'call',
                },
            },
        });
    });

    const renderDurationContainer = (
        mocked_store: TCoreStores,
        unit = 'm',
        setUnit = jest.fn(),
        selected_hour = [0, 0],
        setSelectedHour = jest.fn(),
        end_date = new Date(),
        setEndDate = jest.fn(),
        end_time = '',
        setEndTime = jest.fn()
    ) => {
        render(
            <TraderProviders store={mocked_store}>
                <DurationActionSheetContainer
                    selected_hour={selected_hour}
                    setSelectedHour={setSelectedHour}
                    unit={unit}
                    setUnit={setUnit}
                    end_date={end_date}
                    setEndDate={setEndDate}
                    end_time={end_time}
                    setEndTime={setEndTime}
                />
            </TraderProviders>
        );
    };

    it('should render the DurationActionSheetContainer with default values', () => {
        renderDurationContainer(default_trade_store);
        expect(screen.getByText('Duration')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should select duration in hours if duration is more than 59 minutes', () => {
        default_trade_store.modules.trade.duration = 130;
        renderDurationContainer(default_trade_store, 'h');

        const duration_chip = screen.getByText('1 h');
        userEvent.click(duration_chip);

        expect(default_trade_store.modules.trade.onChangeMultiple).not.toHaveBeenCalled();
    });

    it('should call onChangeMultiple with correct data with hours', () => {
        default_trade_store.modules.trade.duration = 130;
        renderDurationContainer(default_trade_store, 'm', jest.fn(), [2, 10], jest.fn());

        userEvent.click(screen.getByText('Save'));

        expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
            duration_unit: 'm',
            duration: 1,
            expiry_time: null,
            expiry_type: 'duration',
        });
    });

    it('should call onChangeMultiple with correct data with ticks', () => {
        default_trade_store.modules.trade.duration = 5;

        renderDurationContainer(default_trade_store, 't');

        userEvent.click(screen.getByText('Save'));

        expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
            duration_unit: 't',
            duration: 5,
            expiry_time: null,
            expiry_type: 'duration',
        });
    });

    it('should call onChangeMultiple with correct data with seconds', () => {
        default_trade_store.modules.trade.duration = 20;

        renderDurationContainer(default_trade_store, 's');
        userEvent.click(screen.getByText('22 sec'));
        userEvent.click(screen.getByText('Save'));

        expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
            duration_unit: 's',
            duration: 20,
            expiry_time: null,
            expiry_type: 'duration',
        });
    });

    it('should call onChangeMultiple with correct data with hour', () => {
        default_trade_store.modules.trade.duration = 4;

        renderDurationContainer(default_trade_store, 'h');
        userEvent.click(screen.getByText('4 h'));
        userEvent.click(screen.getByText('Save'));

        expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
            duration_unit: 'm',
            duration: 60,
            expiry_time: null,
            expiry_type: 'duration',
        });
    });

    it('should show Expiry Date when days are selected', () => {
        renderDurationContainer(default_trade_store, 'd');
        expect(screen.getByText('Expiry')).toBeInTheDocument();
    });

    it('should show End Time Screen on selecting the days unit', () => {
        renderDurationContainer(default_trade_store, 'd');

        const date_input = screen.getByTestId('dt_date_input');
        const time_input = screen.getByDisplayValue('12:59:59 GMT');
        expect(date_input).toBeInTheDocument();
        expect(time_input).toBeInTheDocument();
    });

    it('should open timepicker on clicking on time input in the days page', () => {
        renderDurationContainer(default_trade_store, 'd');
        const time_input = screen.getByDisplayValue('12:59:59 GMT');
        expect(time_input).toBeInTheDocument();
        userEvent.click(time_input);
        expect(screen.getByText('Pick an end time'));
    });

    it('should open datepicker on clicking on date input in the days page', () => {
        renderDurationContainer(default_trade_store, 'd');
        const date_input = screen.getByTestId('dt_date_input');
        expect(date_input).toBeInTheDocument();
        userEvent.click(date_input);
        expect(screen.getByText('Pick an end date'));
    });

    it('should not render chips if duration_units_list contains only ticks', () => {
        default_trade_store.modules.trade.duration = 1;
        default_trade_store.modules.trade.duration_unit = 't';
        default_trade_store.modules.trade.duration_units_list = [{ value: 't' }];
        renderDurationContainer(default_trade_store);

        const chip_names = ['Ticks', 'Seconds', 'Minutes', 'Hours', 'Days', 'End Time'];
        chip_names.forEach(name => expect(screen.queryByText(name)).not.toBeInTheDocument());
    });
});
