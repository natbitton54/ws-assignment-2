import React from 'react';

/**
 * Pagination Component
 *
 * Renders a set of page navigation buttons including numbered pages, Previous, and Next.
 *
 * @component
 * @param {Object} props
 * @param {number} props.page - The current active page.
 * @param {number} props.totalPages - Total number of pages.
 * @param {function} props.onPageChange - Function to call when a different page is selected.
 * @param {number} [props.visiblePages=5] - How many page numbers to show at once.
 * @returns {JSX.Element} Rendered pagination component.
 * 
 * @author `NatBitton54`
 */
const Pagination = ({
    page,
    totalPages,
    onPageChange,
    visiblePages = 5,
}) => {
    const items = [];

    // Calculate the starting page (center the current page if possible)
    let startPage = Math.max(1, page - Math.floor(visiblePages / 2));

    // Calculate ending page based on starting point
    let endPage = startPage + visiblePages - 1;

    // Adjust startPage if endPage exceeds totalPages
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - visiblePages + 1);
    }

    // Add "Previous" button if not on first page
    if (page > 1) {
        items.push(
            <li key="prev" className="page-item">
                <button className="page-link" onClick={() => onPageChange(page - 1)}>
                    Previous
                </button>
            </li>
        );
    }

    // Add number buttons for current visible page range
    for (let i = startPage; i <= endPage; i++) {
        items.push(
            <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(i)}>
                    {i}
                </button>
            </li>
        );
    }

    // Add "Next" button if not on last page
    if (page < totalPages) {
        items.push(
            <li key="next" className="page-item">
                <button className="page-link" onClick={() => onPageChange(page + 1)}>
                    Next
                </button>
            </li>
        );
    }

    return <ul className="pagination justify-content-center">{items}</ul>;
};

export default Pagination;
