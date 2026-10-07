let currentLostFoundType = "LOST";


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("lost-found-form");

    if (form) {
        form.addEventListener("submit", submitLostFoundReport);
    }

    const search = document.getElementById("lf-found-search");

    if (search) {
        search.addEventListener("input", function () {
            loadFoundItems(this.value.trim());
        });
    }

    loadFoundItems();
    loadMyLostReports();
});


/* =========================================
   OPEN FORM
========================================= */

function openLostFoundForm(type) {

    currentLostFoundType = type;

    const container =
        document.getElementById("lf-form-container");

    const hiddenType =
        document.getElementById("lf-item-type");

    const title =
        document.getElementById("lf-form-title");

    const description =
        document.getElementById("lf-form-description");

    const badge =
        document.getElementById("lf-form-badge");


    if (!container) {
        console.error("Lost & Found form container not found.");
        return;
    }


    if (hiddenType) {
        hiddenType.value = type;
    }


    if (type === "LOST") {

        if (title) {
            title.textContent = "Report Lost Item";
        }

        if (description) {
            description.textContent =
                "Enter the details of the item you lost.";
        }

        if (badge) {
            badge.textContent = "LOST ITEM";
        }

    } else {

        if (title) {
            title.textContent = "Report Found Item";
        }

        if (description) {
            description.textContent =
                "Enter the details of the item you found.";
        }

        if (badge) {
            badge.textContent = "FOUND ITEM";
        }
    }


    document
        .getElementById("lf-lost-btn")
        ?.classList.toggle(
            "active",
            type === "LOST"
        );


    document
        .getElementById("lf-found-btn")
        ?.classList.toggle(
            "active",
            type === "FOUND"
        );


    container.classList.add("visible");


    container.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================
   CLOSE FORM
========================================= */

function closeLostFoundForm() {

    const container =
        document.getElementById("lf-form-container");

    const form =
        document.getElementById("lost-found-form");

    const imageName =
        document.getElementById("lf-image-name");


    if (container) {
        container.classList.remove("visible");
    }


    if (form) {
        form.reset();
    }


    if (imageName) {
        imageName.textContent = "";
    }


    document
        .getElementById("lf-lost-btn")
        ?.classList.remove("active");


    document
        .getElementById("lf-found-btn")
        ?.classList.remove("active");


    currentLostFoundType = "LOST";
}


/* =========================================
   IMAGE NAME
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const imageInput =
        document.getElementById("lf-item-image");

    const imageName =
        document.getElementById("lf-image-name");


    if (imageInput && imageName) {

        imageInput.addEventListener("change", function () {

            if (this.files && this.files.length > 0) {

                imageName.textContent =
                    this.files[0].name;

            } else {

                imageName.textContent = "";
            }
        });
    }
});


/* =========================================
   SUBMIT REPORT
========================================= */

async function submitLostFoundReport(event) {

    event.preventDefault();


    const itemName =
        document
            .getElementById("lf-item-name")
            .value
            .trim();


    const description =
        document
            .getElementById("lf-item-description")
            .value
            .trim();


    const location =
        document
            .getElementById("lf-item-location")
            .value
            .trim();


    const date =
        document
            .getElementById("lf-item-date")
            .value;


    const imageInput =
        document.getElementById("lf-item-image");


    /* ==============================
       VALIDATION
    ============================== */

    if (!itemName) {

        showToast(
            "Please enter the item name.",
            "error"
        );

        return;
    }


    if (!description) {

        showToast(
            "Please enter the description.",
            "error"
        );

        return;
    }


    if (!date) {

        showToast(
            "Please select the date.",
            "error"
        );

        return;
    }


    /* ==============================
       SUBMIT TO BACKEND
    ============================== */

    try {

        const response =
            await fetch(
                "/api/lost-found",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({

                        type:
                            currentLostFoundType,

                        itemName:
                            itemName,

                        description:
                            description,

                        location:
                            location,

                        date:
                            date,

                        imageUrl:
                            ""
                    })
                }
            );


        const data =
            await response.json();


        if (response.status === 401) {

            window.location.href =
                "/login.html";

            return;
        }


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to submit report"
            );
        }


        /* =================================
           SUCCESS
        ================================= */

        showToast(
            "Report submitted",
            "success"
        );


        const submittedType =
            currentLostFoundType;


        closeLostFoundForm();


        /* Refresh database lists */

        if (submittedType === "LOST") {

            loadMyLostReports();

        } else {

            loadFoundItems();
        }


    } catch (error) {

        console.error(
            "Lost & Found submit error:",
            error
        );


        showToast(
            error.message ||
            "Unable to submit report",
            "error"
        );
    }
}


/* =========================================
   LOAD FOUND ITEMS
========================================= */

async function loadFoundItems(searchText = "") {

    const list =
        document.getElementById(
            "lf-found-list"
        );


    if (!list) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/lost-found/found",
                {
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            window.location.href =
                "/login.html";

            return;
        }


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load found items"
            );
        }


        let items =
            data.items || [];


        /* ==============================
           SEARCH
        ============================== */

        const query =
            searchText
                .toLowerCase()
                .trim();


        if (query) {

            items =
                items.filter(
                    function (item) {

                        return (

                            (item.itemName || "")
                                .toLowerCase()
                                .includes(query)

                            ||

                            (item.description || "")
                                .toLowerCase()
                                .includes(query)

                            ||

                            (item.location || "")
                                .toLowerCase()
                                .includes(query)

                        );
                    }
                );
        }


        renderFoundItems(items);


    } catch (error) {

        console.error(
            "Load found items error:",
            error
        );


        list.innerHTML = `
            <div class="lf-empty">

                <strong>
                    Unable to load found items
                </strong>

                <span>
                    Please refresh the page and try again.
                </span>

            </div>
        `;
    }
}


/* =========================================
   RENDER FOUND ITEMS
========================================= */

function renderFoundItems(items) {

    const list =
        document.getElementById(
            "lf-found-list"
        );


    if (!list) {
        return;
    }


    if (!items.length) {

        list.innerHTML = `
            <div class="lf-empty">

                <div class="lf-empty-icon">
                    ✓
                </div>

                <strong>
                    No found items
                </strong>

                <span>
                    No found item reports are available.
                </span>

            </div>
        `;

        return;
    }


    list.innerHTML =
        items.map(
            function (item) {

                return `
                    <div class="lf-report-card">

                        <div class="lf-report-icon found">
                            ✓
                        </div>


                        <div class="lf-report-content">

                            <h5>
                                ${escapeLF(
                                    item.itemName
                                )}
                            </h5>


                            <p>
                                ${escapeLF(
                                    item.description
                                )}
                            </p>


                            <div class="lf-report-meta">

                                ${
                                    item.location
                                    ? `
                                        <span>
                                            📍
                                            ${escapeLF(
                                                item.location
                                            )}
                                        </span>
                                    `
                                    : ""
                                }


                                <span>
                                    📅
                                    ${formatDate(
                                        item.date
                                    )}
                                </span>

                            </div>

                        </div>


                        <span
                            class="lf-report-badge found">
                            FOUND
                        </span>

                    </div>
                `;

            }
        ).join("");
}


/* =========================================
   LOAD MY LOST REPORTS
========================================= */

async function loadMyLostReports() {

    const list =
        document.getElementById(
            "lf-my-reports-list"
        );


    const count =
        document.getElementById(
            "lf-my-reports-count"
        );


    if (!list) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/lost-found/my",
                {
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            window.location.href =
                "/login.html";

            return;
        }


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load your reports"
            );
        }


        const items =
            data.items || [];


        if (count) {

            count.textContent =
                items.length === 1
                    ? "1 Report"
                    : `${items.length} Reports`;
        }


        renderMyLostReports(items);


    } catch (error) {

        console.error(
            "Load my lost reports error:",
            error
        );


        list.innerHTML = `
            <div class="lf-empty">

                <strong>
                    Unable to load your reports
                </strong>

                <span>
                    Please refresh the page and try again.
                </span>

            </div>
        `;
    }
}


/* =========================================
   RENDER MY LOST REPORTS
========================================= */

function renderMyLostReports(items) {

    const list =
        document.getElementById(
            "lf-my-reports-list"
        );


    if (!list) {
        return;
    }


    if (!items.length) {

        list.innerHTML = `
            <div class="lf-empty">

                <div class="lf-empty-icon">
                    ⌕
                </div>

                <strong>
                    No lost item reports
                </strong>

                <span>
                    Your submitted lost items will appear here.
                </span>

            </div>
        `;

        return;
    }


    list.innerHTML =
        items.map(
            function (item) {

                return `
                    <div class="lf-report-card">

                        <div class="lf-report-icon lost">
                            ⌕
                        </div>


                        <div class="lf-report-content">

                            <h5>
                                ${escapeLF(
                                    item.itemName
                                )}
                            </h5>


                            <p>
                                ${escapeLF(
                                    item.description
                                )}
                            </p>


                            <div class="lf-report-meta">

                                ${
                                    item.location
                                    ? `
                                        <span>
                                            📍
                                            ${escapeLF(
                                                item.location
                                            )}
                                        </span>
                                    `
                                    : ""
                                }


                                <span>
                                    📅
                                    ${formatDate(
                                        item.date
                                    )}
                                </span>

                            </div>

                        </div>


                        <span
                            class="lf-report-badge lost">
                            LOST
                        </span>

                    </div>
                `;

            }
        ).join("");
}


/* =========================================
   HELPERS
========================================= */

function formatDate(date) {

    if (!date) {
        return "-";
    }


    const d =
        new Date(date);


    if (Number.isNaN(d.getTime())) {
        return date;
    }


    return d.toLocaleDateString(
        "en-IN"
    );
}


function escapeLF(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}