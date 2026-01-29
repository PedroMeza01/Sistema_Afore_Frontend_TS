import React from "react";

const Pagination = ({ currentPage, totalPages, handlePageChange }) => {
    const generatePageNumbers = () => {
        let pages = [];
        if (totalPages <= 10) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            if (currentPage <= 9) {
                pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            } else if (currentPage >= totalPages - 9) {
                pages = [1, "...", totalPages - 10, totalPages - 9, totalPages - 8, totalPages - 7, totalPages - 6, totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, "...", currentPage - 4, currentPage - 3, currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, currentPage + 3, currentPage + 4, "...", totalPages];
            }
        }
        return pages;
    };

    const handleClick = (page) => {
        if (page !== "...") {
            handlePageChange(page);
            window.scrollTo(0, 0); // Hace que la página aparezca arriba inmediatamente
        }
    };

    return (
        <div className="pagination">
            <button
                disabled={currentPage === 1}
                onClick={() => handleClick(currentPage - 1)}
            >
                Anterior
            </button>

            {generatePageNumbers().map((page, index) => (
                <button
                    key={index}
                    disabled={page === "..."}
                    className={page === currentPage ? "active" : ""}
                    onClick={() => handleClick(page)}
                >
                    {page}
                </button>
            ))}

            <button
                disabled={currentPage === totalPages}
                onClick={() => handleClick(currentPage + 1)}
            >
                Siguiente
            </button>
        </div>
    );
};

export default Pagination;

