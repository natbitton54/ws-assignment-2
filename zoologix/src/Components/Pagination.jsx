import React from 'react';

/**
 * A reusable Pagination component.
 *
 * Props:
 * - page: current page (number)
 * - totalPages: total pages (number)
 * - onPageChange: function(newPage) => void
 * - visiblePages: how many page buttons to display (number)
 */
const Pagination = ({
    page,
    totalPages,
    onPageChange,
    visiblePages = 5,
}) => {
    // Build page items
    const items = [];

    let startPage = Math.max(1, page - Math.floor(visiblePages / 2));
    let endPage = startPage + visiblePages - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - visiblePages + 1);
    }

    // Previous button
    if (page > 1) {
        items.push(
            <li key="prev" className="page-item">
                <button
                    className="page-link"
                    onClick={() => onPageChange(page - 1)}
                >
                    Previous
                </button>
            </li>
        );
    }

    // Numbered page buttons
    for (let i = startPage; i <= endPage; i++) {
        items.push(
            <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                <button
                    className="page-link"
                    onClick={() => onPageChange(i)}
                >
                    {i}
                </button>
            </li>
        );
    }

    // Next button
    if (page < totalPages) {
        items.push(
            <li key="next" className="page-item">
                <button
                    className="page-link"
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </button>
            </li>
        );
    }

    return <ul className="pagination justify-content-center">{items}</ul>;
};

export default Pagination;
