
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import RiskManagementInfoModal from '../risk-management-info-modal';
import userEvent from '@testing-library/user-event';

jest.mock('@deriv/quill-icons', () => ({
    LabelPairedCircleInfoSmRegularIcon: () => <svg />,
}));

describe('RiskManagementInfoModal', () => {
    const headerContent = 'Risk Management Info';
    const bodyContent = 'This is the body content of the modal.';
    const infoMessage = 'Additional info message';

    it('should render the button and modal content correctly', () => {
        render(
            <RiskManagementInfoModal
                header_content={headerContent}
                body_content={bodyContent}
                info_message={infoMessage}
            />
        );

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();

        expect(screen.queryByText(headerContent)).not.toBeInTheDocument();
    });

    it('should toggle the modal visibility when the button is clicked', () => {
        render(
            <RiskManagementInfoModal
                header_content={headerContent}
                body_content={bodyContent}
                info_message={infoMessage}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByText(headerContent)).toBeInTheDocument();
        expect(screen.getByText(bodyContent)).toBeInTheDocument();
        expect(screen.getByText(infoMessage)).toBeInTheDocument();

        fireEvent.click(button);

        expect(screen.queryByText(headerContent)).not.toBeInTheDocument();
    });

    it('should not render the info message if it is not provided', () => {
        render(<RiskManagementInfoModal header_content={headerContent} body_content={bodyContent} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByText(headerContent)).toBeInTheDocument();
        expect(screen.getByText(bodyContent)).toBeInTheDocument();
        expect(screen.queryByText(infoMessage)).not.toBeInTheDocument();
    });

    it('should close the modal when the primary button is clicked', () => {
        render(
            <RiskManagementInfoModal
                header_content={headerContent}
                body_content={bodyContent}
                info_message={infoMessage}
            />
        );

        const button = screen.getByRole('button');
        userEvent.click(button);

        expect(screen.getByText(headerContent)).toBeInTheDocument();

        const primaryButton = screen.getByText('Got it');
        userEvent.click(primaryButton);

        waitFor(() => expect(screen.queryByText(headerContent)).not.toBeInTheDocument());
    });
});