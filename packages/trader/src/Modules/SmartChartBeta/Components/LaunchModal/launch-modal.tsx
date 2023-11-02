import { Button, DesktopWrapper, MobileWrapper, Modal, PageOverlay, UILoader } from '@deriv/components';
import { getUrlBase } from '@deriv/shared';

import { Localize } from '@deriv/translations';
import React, { useState } from 'react';
import './launch-modal.scss';
import { observer } from 'mobx-react';
import { useStore } from '@deriv/stores';

const InfoDisplay = () => (
    <div className='info' data-testid='launch-modal'>
        <img src={getUrlBase('/public/images/common/chart-launch.png')} />
        <h1 className='title'>Deriv Trader Chart v2.0</h1>
        <p className='sub-title'>
            <Localize i18n_default_text='Smoother charts. Smarter insights' /> .
        </p>
    </div>
);

const LaunchModal = observer(() => {
    const [open, setOpen] = useState(true);
    const {
        client: { is_logged_in },
    } = useStore();

    const handleOpen = () => {
        setOpen(!open);
        localStorage.setItem('launchModalShown', JSON.stringify(true));
    };

    const is_already_shown: false | true = JSON.parse(localStorage.getItem('launchModalShown') || 'false');

    const ContinueButton = () => (
        <Modal.Footer>
            <Button has_effect onClick={handleOpen} primary large>
                <Localize i18n_default_text='Continue' />
            </Button>
        </Modal.Footer>
    );

    return (
        <React.Suspense fallback={<UILoader />}>
            <DesktopWrapper>
                <Modal
                    has_close_icon={false}
                    is_open={is_logged_in && open && !is_already_shown}
                    className='launch-modal'
                    width='432px'
                    height='464px'
                    portalId='modal_root'
                    header={'  '}
                >
                    <Modal.Body>
                        <InfoDisplay />
                    </Modal.Body>
                    <ContinueButton />
                </Modal>
            </DesktopWrapper>
            <MobileWrapper>
                <PageOverlay
                    is_open={is_logged_in && open && !is_already_shown}
                    portal_id='modal_root'
                    onClickClose={handleOpen}
                >
                    <div className='launch-modal'>
                        <InfoDisplay />
                        <ContinueButton />
                    </div>
                </PageOverlay>
            </MobileWrapper>
        </React.Suspense>
    );
});

export default LaunchModal;
