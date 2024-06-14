import { Button, Text } from '@deriv-com/quill-ui';
import { RemainingTime } from '@deriv/components';
import {
    TContractInfo,
    formatMoney,
    getCardLabels,
    isMultiplierContract,
    isValidToCancel,
    isValidToSell,
} from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { observer } from 'mobx-react';
import React from 'react';

type ContractInfoProps = {
    contract_info: TContractInfo;
};

const ContractDetailsFooter = observer(({ contract_info }: ContractInfoProps) => {
    const {
        bid_price,
        currency,
        contract_id,
        cancellation: { date_expiry: cancellation_date_expiry } = {},
        profit,
        contract_type,
    } = contract_info;

    const { contract_replay, common } = useStore();
    const { server_time } = common;
    const { onClickCancel, onClickSell, is_sell_requested } = contract_replay;
    const is_valid_to_sell = isValidToSell(contract_info);
    const is_valid_to_cancel = isValidToCancel(contract_info);
    const is_multiplier = isMultiplierContract(contract_type);

    const cardLabels = getCardLabels();
    const bidDetails = !is_valid_to_cancel ? `@${bid_price} ${currency}` : '';
    const label = `${cardLabels.CLOSE} ${bidDetails}`;

    return (
        <div className='contract-details-footer--container'>
            {is_multiplier ? (
                <>
                    <Button
                        variant='secondary'
                        label={label}
                        color='black'
                        size='lg'
                        isLoading={is_sell_requested}
                        disabled={is_sell_requested || (Number(profit) < 0 && is_valid_to_cancel)}
                        onClick={() => onClickSell(contract_id)}
                        fullWidth
                    />
                    {is_valid_to_cancel && (
                        <Button
                            onClick={() => onClickCancel(contract_id)}
                            variant='secondary'
                            label={
                                <>
                                    {getCardLabels().CANCEL}
                                    {'  '}
                                    <RemainingTime
                                        as='span'
                                        end_time={cancellation_date_expiry}
                                        format='mm:ss'
                                        className='color'
                                        getCardLabels={getCardLabels}
                                        start_time={server_time}
                                    />
                                </>
                            }
                            color='black'
                            disabled={Number(profit) >= 0}
                            size='lg'
                            fullWidth
                        />
                    )}
                </>
            ) : (
                <Button
                    variant='secondary'
                    label={
                        is_valid_to_sell
                            ? `${getCardLabels().CLOSE} @ ${formatMoney(bid_price)} ${(currency)}`
                            : getCardLabels().RESALE_NOT_OFFERED
                    }
                    color='black'
                    size='lg'
                    isLoading={is_sell_requested && is_valid_to_sell}
                    onClick={is_valid_to_sell ? () => onClickSell(contract_id) : undefined}
                    fullWidth
                    disabled={!is_valid_to_sell}
                />
            )}
        </div>
    );
});

export default ContractDetailsFooter;
