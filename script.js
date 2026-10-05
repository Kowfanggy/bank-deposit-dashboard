d3.csv("bank_clean.csv")
    .then(function(data) {


    /* =================================
       DATA TYPE
    ================================= */

    data.forEach(function(d) {

        d.age = +d.age;

        d.balance = +d.balance;

        d.duration = +d.duration;

        d.campaign = +d.campaign;

        d.pdays = +d.pdays;

        d.previous = +d.previous;

        d.day = +d.day;

    });


    /* =================================
       GLOBAL VARIABLES
    ================================= */

    let filteredData = data;

    let currentPage = 1;

    const rowsPerPage = 20;


    const tooltip =
        d3.select("#tooltip");


    /* =================================
       JOB FILTER
    ================================= */

    const jobs =
        [...new Set(
            data.map(
                d => d.job
            )
        )].sort();


    jobs.forEach(function(job) {

        d3.select("#jobFilter")

            .append("option")

            .attr(
                "value",
                job
            )

            .text(job);

    });


    /* =================================
       FILTER EVENT
    ================================= */

    d3.select("#jobFilter")
        .on(
            "change",
            function() {

                currentPage = 1;

                updateDashboard();

            }
        );


    d3.select("#depositFilter")
        .on(
            "change",
            function() {

                currentPage = 1;

                updateDashboard();

            }
        );


    /* =================================
       SEARCH
    ================================= */

    d3.select("#searchInput")
        .on(
            "input",
            function() {

                currentPage = 1;

                renderTable(
                    filteredData
                );

            }
        );


    /* =================================
       ANIMATION BUTTON
    ================================= */

    d3.select("#animateBarBtn")
        .on(
            "click",
            function() {

                animateButton(this);

                drawBarChart(
                    filteredData,
                    true
                );

            }
        );


    d3.select("#animateDonutBtn")
        .on(
            "click",
            function() {

                animateButton(this);

                drawDonutChart(
                    filteredData,
                    true
                );

            }
        );


    d3.select("#animateLineBtn")
        .on(
            "click",
            function() {

                animateButton(this);

                drawLineChart(
                    filteredData,
                    true
                );

            }
        );


    /* =================================
       BUTTON ANIMATION
    ================================= */

    function animateButton(button) {

        const btn =
            d3.select(button);


        btn.classed(
            "playing",
            true
        );


        btn.text(
            "⏳ Playing..."
        );


        setTimeout(function() {

            btn.classed(
                "playing",
                false
            );

            btn.text(
                "▶ Animate"
            );

        }, 1800);

    }


    /* =================================
       UPDATE DASHBOARD
    ================================= */

    function updateDashboard() {


        const selectedJob =
            d3.select("#jobFilter")
                .property("value");


        const selectedDeposit =
            d3.select("#depositFilter")
                .property("value");


        filteredData =
            data.filter(function(d) {


                const jobMatch =
                    selectedJob === "All" ||
                    d.job === selectedJob;


                const depositMatch =
                    selectedDeposit === "All" ||
                    d.deposit === selectedDeposit;


                return (
                    jobMatch &&
                    depositMatch
                );

            });


        updateKPI(
            filteredData
        );


        renderTable(
            filteredData
        );


        drawBarChart(
            filteredData,
            true
        );


        drawDonutChart(
            filteredData,
            true
        );


        drawLineChart(
            filteredData,
            true
        );

    }


    /* =================================
       KPI
    ================================= */

    function updateKPI(dataSet) {


        const total =
            dataSet.length;


        const depositYes =
            dataSet.filter(
                d => d.deposit === "yes"
            ).length;


        const avgAge =
            total > 0
                ? d3.mean(
                    dataSet,
                    d => d.age
                )
                : 0;


        const avgBalance =
            total > 0
                ? d3.mean(
                    dataSet,
                    d => d.balance
                )
                : 0;


        animateNumber(
            "#totalCustomers",
            total,
            0
        );


        animateNumber(
            "#depositYes",
            depositYes,
            0
        );


        animateNumber(
            "#averageAge",
            avgAge,
            1
        );


        animateNumber(
            "#averageBalance",
            avgBalance,
            2
        );

    }


    /* =================================
       NUMBER ANIMATION
    ================================= */

    function animateNumber(
        selector,
        target,
        decimals
    ) {


        const element =
            d3.select(selector);


        const current =
            parseFloat(
                element
                    .text()
                    .replace(/,/g, "")
            ) || 0;


        element
            .transition()
            .duration(700)
            .tween(
                "text",
                function() {


                    const interpolate =
                        d3.interpolateNumber(
                            current,
                            target
                        );


                    return function(t) {

                        element.text(
                            d3.format(
                                `,.${decimals}f`
                            )(
                                interpolate(t)
                            )
                        );

                    };

                }
            );

    }


    /* =================================
       TABLE + PAGINATION
    ================================= */

    function renderTable(dataSet) {


        const searchText =
            d3.select("#searchInput")
                .property("value")
                .toLowerCase()
                .trim();


        const tableData =
            dataSet.filter(function(d) {


                const text = (

                    d.job + " " +
                    d.age + " " +
                    d.balance + " " +
                    d.housing + " " +
                    d.loan + " " +
                    d.deposit

                ).toLowerCase();


                return text.includes(
                    searchText
                );

            });


        const totalPages =
            Math.ceil(
                tableData.length /
                rowsPerPage
            );


        if (
            currentPage >
            totalPages &&
            totalPages > 0
        ) {

            currentPage =
                totalPages;

        }


        if (totalPages === 0) {

            currentPage = 1;

        }


        const startIndex =
            (currentPage - 1) *
            rowsPerPage;


        const endIndex =
            Math.min(
                startIndex +
                rowsPerPage,
                tableData.length
            );


        const pageData =
            tableData.slice(
                startIndex,
                endIndex
            );


        const tbody =
            d3.select("#tableBody");


        tbody
            .selectAll("tr")
            .remove();


        if (
            pageData.length === 0
        ) {

            tbody
                .append("tr")
                .append("td")

                .attr(
                    "colspan",
                    6
                )

                .style(
                    "padding",
                    "30px"
                )

                .text(
                    "ไม่พบข้อมูล"
                );

        }


        const rows =
            tbody
                .selectAll("tr")
                .data(pageData)
                .enter()
                .append("tr");


        rows
            .style(
                "opacity",
                0
            )

            .transition()

            .duration(250)

            .style(
                "opacity",
                1
            );


        rows.append("td")
            .text(
                d => d.job
            );


        rows.append("td")
            .text(
                d => d.age
            );


        rows.append("td")
            .text(
                d =>
                    d3.format(
                        ",.2f"
                    )(d.balance)
            );


        rows.append("td")
            .text(
                d => d.housing
            );


        rows.append("td")
            .text(
                d => d.loan
            );


        rows.append("td")
            .text(
                d => d.deposit
            );


        const pageInfo =
            d3.select("#pageInfo");


        if (
            tableData.length === 0
        ) {

            pageInfo.text(
                "ไม่พบข้อมูล"
            );

        } else {

            pageInfo.text(
                `Showing ${startIndex + 1}–${endIndex}
                 of ${tableData.length.toLocaleString()}
                 records`
            );

        }


        createPagination(
            totalPages
        );

    }


    /* =================================
       PAGINATION
    ================================= */

    function createPagination(
        totalPages
    ) {


        const pagination =
            d3.select("#pagination");


        pagination
            .selectAll("*")
            .remove();


        if (
            totalPages <= 1
        ) {

            return;

        }


        pagination
            .append("button")

            .attr(
                "class",
                "page-btn prev-next"
            )

            .property(
                "disabled",
                currentPage === 1
            )

            .text(
                "‹ Prev"
            )

            .on(
                "click",
                function() {

                    if (
                        currentPage > 1
                    ) {

                        currentPage--;

                        renderTable(
                            filteredData
                        );

                    }

                }
            );


        const maxButtons = 5;


        let startPage =
            Math.max(
                1,
                currentPage -
                Math.floor(
                    maxButtons / 2
                )
            );


        let endPage =
            Math.min(
                totalPages,
                startPage +
                maxButtons -
                1
            );


        if (
            endPage -
            startPage +
            1 <
            maxButtons
        ) {

            startPage =
                Math.max(
                    1,
                    endPage -
                    maxButtons +
                    1
                );

        }


        if (
            startPage > 1
        ) {

            addPageButton(1);


            if (
                startPage > 2
            ) {

                pagination
                    .append("span")
                    .attr(
                        "class",
                        "page-dots"
                    )
                    .text("...");

            }

        }


        for (
            let i = startPage;
            i <= endPage;
            i++
        ) {

            addPageButton(i);

        }


        if (
            endPage < totalPages
        ) {

            if (
                endPage <
                totalPages - 1
            ) {

                pagination
                    .append("span")
                    .attr(
                        "class",
                        "page-dots"
                    )
                    .text("...");

            }


            addPageButton(
                totalPages
            );

        }


        pagination
            .append("button")

            .attr(
                "class",
                "page-btn prev-next"
            )

            .property(
                "disabled",
                currentPage === totalPages
            )

            .text(
                "Next ›"
            )

            .on(
                "click",
                function() {

                    if (
                        currentPage <
                        totalPages
                    ) {

                        currentPage++;

                        renderTable(
                            filteredData
                        );

                    }

                }
            );


        function addPageButton(
            page
        ) {


            pagination
                .append("button")

                .attr(
                    "class",
                    "page-btn"
                )

                .classed(
                    "active",
                    page === currentPage
                )

                .text(page)

                .on(
                    "click",
                    function() {

                        currentPage =
                            page;

                        renderTable(
                            filteredData
                        );

                    }
                );

        }

    }


    /* =================================
       BAR CHART
       CLICK = JOB FILTER
    ================================= */

    function drawBarChart(
        dataSet,
        animate
    ) {


        d3.select("#barChart")
            .selectAll("*")
            .remove();


        const width = 600;

        const height = 330;

        const margin = {

            top: 30,

            right: 30,

            bottom: 90,

            left: 65

        };


        const svg =
            d3.select("#barChart")

                .append("svg")

                .attr(
                    "width",
                    width
                )

                .attr(
                    "height",
                    height
                );


        const grouped =
            d3.rollups(

                dataSet.filter(
                    d => d.deposit === "yes"
                ),

                v => v.length,

                d => d.job

            );


        const chartData =
            grouped.map(
                d => ({

                    job: d[0],

                    count: d[1]

                })
            );


        chartData.sort(
            (a, b) =>
                d3.descending(
                    a.count,
                    b.count
                )
        );


        const x =
            d3.scaleBand()

                .domain(
                    chartData.map(
                        d => d.job
                    )
                )

                .range([
                    margin.left,
                    width - margin.right
                ])

                .padding(0.25);


        const y =
            d3.scaleLinear()

                .domain([

                    0,

                    d3.max(
                        chartData,
                        d => d.count
                    ) || 1

                ])

                .nice()

                .range([

                    height -
                    margin.bottom,

                    margin.top

                ]);


        svg.append("g")

            .attr(
                "transform",
                `translate(
                    0,
                    ${height - margin.bottom}
                )`
            )

            .call(
                d3.axisBottom(x)
            )

            .selectAll("text")

            .attr(
                "transform",
                "rotate(-35)"
            )

            .style(
                "text-anchor",
                "end"
            );


        svg.append("g")

            .attr(
                "transform",
                `translate(
                    ${margin.left},
                    0
                )`
            )

            .call(
                d3.axisLeft(y)
            );


        const bars =
            svg.append("g")

                .selectAll("rect")

                .data(chartData)

                .enter()

                .append("rect")

                .attr(
                    "class",
                    "bar"
                )

                .classed(
                    "selected",
                    d =>
                        d.job ===
                        d3.select(
                            "#jobFilter"
                        ).property("value")
                )

                .attr(
                    "x",
                    d => x(d.job)
                )

                .attr(
                    "width",
                    x.bandwidth()
                );


        if (animate) {

            bars

                .attr(
                    "y",
                    height -
                    margin.bottom
                )

                .attr(
                    "height",
                    0
                )

                .transition()

                .duration(900)

                .delay(
                    (d, i) =>
                        i * 80
                )

                .attr(
                    "y",
                    d => y(d.count)
                )

                .attr(
                    "height",
                    d =>
                        height -
                        margin.bottom -
                        y(d.count)
                );

        } else {

            bars

                .attr(
                    "y",
                    d => y(d.count)
                )

                .attr(
                    "height",
                    d =>
                        height -
                        margin.bottom -
                        y(d.count)
                );

        }


        bars

            .on(
                "mouseover",
                function(event, d) {

                    d3.select(this)
                        .attr(
                            "fill",
                            "#74C69D"
                        );


                    tooltip

                        .style(
                            "opacity",
                            1
                        )

                        .html(`
                            <strong>
                                ${d.job}
                            </strong>

                            <br>

                            Deposit Yes:
                            ${d.count.toLocaleString()}
                            คน

                            <br>

                            🖱️ Click to filter
                        `)

                        .style(
                            "left",
                            event.pageX + 12 + "px"
                        )

                        .style(
                            "top",
                            event.pageY - 35 + "px"
                        );

                }
            )

            .on(
                "mouseout",
                function(event, d) {

                    const selectedJob =
                        d3.select(
                            "#jobFilter"
                        ).property(
                            "value"
                        );


                    d3.select(this)
                        .attr(
                            "fill",
                            d.job ===
                            selectedJob
                                ? "#74C69D"
                                : "#A8E6CF"
                        );


                    tooltip.style(
                        "opacity",
                        0
                    );

                }
            )


            /* ==========================
               CLICK BAR
            ========================== */

            .on(
                "click",
                function(event, d) {


                    const currentJob =
                        d3.select(
                            "#jobFilter"
                        ).property(
                            "value"
                        );


                    if (
                        currentJob === d.job
                    ) {

                        d3.select(
                            "#jobFilter"
                        ).property(
                            "value",
                            "All"
                        );

                    } else {

                        d3.select(
                            "#jobFilter"
                        ).property(
                            "value",
                            d.job
                        );

                    }


                    currentPage = 1;

                    updateDashboard();

                }
            );

    }


    /* =================================
       DONUT CHART
       CLICK = DEPOSIT FILTER
    ================================= */

    function drawDonutChart(
        dataSet,
        animate
    ) {


        d3.select("#donutChart")
            .selectAll("*")
            .remove();


        const width = 600;

        const height = 330;

        const radius = 105;


        const svg =
            d3.select("#donutChart")

                .append("svg")

                .attr(
                    "width",
                    width
                )

                .attr(
                    "height",
                    height
                );


        const yes =
            dataSet.filter(
                d => d.deposit === "yes"
            ).length;


        const no =
            dataSet.filter(
                d => d.deposit === "no"
            ).length;


        const total =
            yes + no;


        const chartData = [

            {
                label: "Yes",
                thai: "ฝากเงิน",
                value: yes,
                color: "#A8E6CF"
            },

            {
                label: "No",
                thai: "ไม่ฝากเงิน",
                value: no,
                color: "#BDE0FE"
            }

        ];


        chartData.forEach(
            function(d) {

                d.percent =
                    total > 0
                        ? (
                            d.value /
                            total
                        ) * 100
                        : 0;

            }
        );


        const selectedDeposit =
            d3.select(
                "#depositFilter"
            ).property(
                "value"
            );


        const chartGroup =
            svg.append("g")

                .attr(
                    "transform",
                    `translate(
                        ${width * 0.36},
                        ${height / 2}
                    )`
                );


        const pie =
            d3.pie()

                .value(
                    d => d.value
                )

                .sort(null);


        const arc =
            d3.arc()

                .innerRadius(65)

                .outerRadius(radius);


        const arcHover =
            d3.arc()

                .innerRadius(65)

                .outerRadius(
                    radius + 10
                );


        const slices =
            chartGroup

                .selectAll("path")

                .data(
                    pie(chartData)
                )

                .enter()

                .append("path")

                .attr(
                    "class",
                    "donut-slice"
                )

                .classed(
                    "selected",
                    d =>
                        d.data.label
                            .toLowerCase() ===
                        selectedDeposit
                )

                .attr(
                    "fill",
                    d => d.data.color
                )

                .attr(
                    "stroke",
                    "#FFFFFF"
                )

                .attr(
                    "stroke-width",
                    2
                );


        if (animate) {

            slices.each(
                function() {

                    this._current = {

                        startAngle: 0,

                        endAngle: 0

                    };

                }
            )

            .attr(
                "d",
                function() {

                    return arc(
                        this._current
                    );

                }
            )

            .transition()

            .duration(1000)

            .ease(
                d3.easeCubicOut
            )

            .attrTween(
                "d",
                function(d) {

                    const interpolate =
                        d3.interpolate(
                            this._current,
                            d
                        );


                    this._current =
                        interpolate(1);


                    return function(t) {

                        return arc(
                            interpolate(t)
                        );

                    };

                }
            );

        } else {

            slices.attr(
                "d",
                arc
            );

        }


        slices

            .on(
                "mouseover",
                function(event, d) {

                    d3.select(this)

                        .transition()

                        .duration(200)

                        .attr(
                            "d",
                            arcHover
                        );


                    tooltip

                        .style(
                            "opacity",
                            1
                        )

                        .html(`
                            <strong>
                                ${d.data.label}
                                (${d.data.thai})
                            </strong>

                            <br>

                            ${d.data.value.toLocaleString()}
                            คน

                            <br>

                            ${d.data.percent.toFixed(2)}%

                            <br>

                            🖱️ Click to filter
                        `)

                        .style(
                            "left",
                            event.pageX + 12 + "px"
                        )

                        .style(
                            "top",
                            event.pageY - 35 + "px"
                        );

                }
            )

            .on(
                "mouseout",
                function() {

                    d3.select(this)

                        .transition()

                        .duration(200)

                        .attr(
                            "d",
                            arc
                        );


                    tooltip.style(
                        "opacity",
                        0
                    );

                }
            )


            /* ==========================
               CLICK DONUT
            ========================== */

            .on(
                "click",
                function(event, d) {


                    const clickedStatus =
                        d.data.label
                            .toLowerCase();


                    const currentStatus =
                        d3.select(
                            "#depositFilter"
                        ).property(
                            "value"
                        );


                    if (
                        currentStatus ===
                        clickedStatus
                    ) {

                        d3.select(
                            "#depositFilter"
                        ).property(
                            "value",
                            "All"
                        );

                    } else {

                        d3.select(
                            "#depositFilter"
                        ).property(
                            "value",
                            clickedStatus
                        );

                    }


                    currentPage = 1;

                    updateDashboard();

                }
            );


        /* ==========================
           DONUT CENTER
        ========================== */

        chartGroup

            .append("text")

            .attr(
                "class",
                "donut-center-number"
            )

            .attr(
                "text-anchor",
                "middle"
            )

            .attr(
                "dy",
                "-2"
            )

            .text(
                total.toLocaleString()
            );


        chartGroup

            .append("text")

            .attr(
                "class",
                "donut-center-text"
            )

            .attr(
                "text-anchor",
                "middle"
            )

            .attr(
                "dy",
                "20"
            )

            .text(
                "Customers"
            );


        /* ==========================
           LEGEND
        ========================== */

        const legend =
            svg.append("g")

                .attr(
                    "transform",
                    `translate(
                        ${width * 0.60},
                        82
                    )`
                );


        chartData.forEach(
            function(d, i) {


                const row =
                    legend.append("g")

                        .attr(
                            "transform",
                            `translate(
                                0,
                                ${i * 90}
                            )`
                        );


                row.append("rect")

                    .attr(
                        "width",
                        18
                    )

                    .attr(
                        "height",
                        18
                    )

                    .attr(
                        "rx",
                        5
                    )

                    .attr(
                        "fill",
                        d.color
                    );


                row.append("text")

                    .attr(
                        "x",
                        28
                    )

                    .attr(
                        "y",
                        14
                    )

                    .attr(
                        "fill",
                        "#477D6C"
                    )

                    .style(
                        "font-size",
                        "14px"
                    )

                    .style(
                        "font-weight",
                        "600"
                    )

                    .text(
                        `${d.label} (${d.thai})`
                    );


                row.append("text")

                    .attr(
                        "x",
                        28
                    )

                    .attr(
                        "y",
                        38
                    )

                    .attr(
                        "fill",
                        "#6B8F84"
                    )

                    .style(
                        "font-size",
                        "13px"
                    )

                    .text(
                        `${d.value.toLocaleString()} คน`
                    );


                row.append("text")

                    .attr(
                        "x",
                        28
                    )

                    .attr(
                        "y",
                        60
                    )

                    .attr(
                        "fill",
                        "#8AA59B"
                    )

                    .style(
                        "font-size",
                        "12px"
                    )

                    .text(
                        `${d.percent.toFixed(2)}%`
                    );

            }
        );

    }


    /* =================================
       LINE CHART
    ================================= */

    function drawLineChart(
        dataSet,
        animate
    ) {


        d3.select("#lineChart")
            .selectAll("*")
            .remove();


        const width = 900;

        const height = 350;

        const margin = {

            top: 30,

            right: 40,

            bottom: 55,

            left: 65

        };


        const svg =
            d3.select("#lineChart")

                .append("svg")

                .attr(
                    "width",
                    width
                )

                .attr(
                    "height",
                    height
                );


        const monthOrder = [

            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec"

        ];


        const monthName = {

            jan: "Jan",
            feb: "Feb",
            mar: "Mar",
            apr: "Apr",
            may: "May",
            jun: "Jun",
            jul: "Jul",
            aug: "Aug",
            sep: "Sep",
            oct: "Oct",
            nov: "Nov",
            dec: "Dec"

        };


        const chartData =
            monthOrder.map(
                function(month) {


                    const count =
                        dataSet.filter(
                            function(d) {

                                return (

                                    d.month &&

                                    d.month
                                        .toLowerCase() ===
                                        month &&

                                    d.deposit ===
                                        "yes"

                                );

                            }
                        ).length;


                    return {

                        month: month,

                        label:
                            monthName[month],

                        count: count

                    };

                }
            );


        const x =
            d3.scalePoint()

                .domain(
                    chartData.map(
                        d => d.label
                    )
                )

                .range([
                    margin.left,
                    width - margin.right
                ]);


        const y =
            d3.scaleLinear()

                .domain([

                    0,

                    d3.max(
                        chartData,
                        d => d.count
                    ) || 1

                ])

                .nice()

                .range([

                    height -
                    margin.bottom,

                    margin.top

                ]);


        svg.append("g")

            .attr(
                "transform",
                `translate(
                    0,
                    ${height - margin.bottom}
                )`
            )

            .call(
                d3.axisBottom(x)
            );


        svg.append("g")

            .attr(
                "transform",
                `translate(
                    ${margin.left},
                    0
                )`
            )

            .call(
                d3.axisLeft(y)
            );


        const line =
            d3.line()

                .x(
                    d => x(d.label)
                )

                .y(
                    d => y(d.count)
                )

                .curve(
                    d3.curveMonotoneX
                );


        const path =
            svg.append("path")

                .datum(chartData)

                .attr(
                    "class",
                    "line"
                )

                .attr(
                    "d",
                    line
                );


        if (animate) {


            const length =
                path.node()
                    .getTotalLength();


            path

                .attr(
                    "stroke-dasharray",
                    length + " " + length
                )

                .attr(
                    "stroke-dashoffset",
                    length
                )

                .transition()

                .duration(1600)

                .attr(
                    "stroke-dashoffset",
                    0
                );

        }


        const points =
            svg.selectAll("circle")

                .data(chartData)

                .enter()

                .append("circle")

                .attr(
                    "class",
                    "line-point"
                )

                .attr(
                    "cx",
                    d => x(d.label)
                )

                .attr(
                    "cy",
                    d => y(d.count)
                );


        if (animate) {

            points

                .attr(
                    "r",
                    0
                )

                .transition()

                .duration(500)

                .delay(
                    (d, i) =>
                        900 + i * 80
                )

                .attr(
                    "r",
                    5
                );

        } else {

            points.attr(
                "r",
                5
            );

        }


        points

            .on(
                "mouseover",
                function(event, d) {

                    d3.select(this)

                        .transition()

                        .attr(
                            "r",
                            8
                        );


                    tooltip

                        .style(
                            "opacity",
                            1
                        )

                        .html(`
                            <strong>
                                ${d.label}
                            </strong>

                            <br>

                            Deposit Yes:
                            ${d.count.toLocaleString()}
                            คน
                        `)

                        .style(
                            "left",
                            event.pageX + 12 + "px"
                        )

                        .style(
                            "top",
                            event.pageY - 35 + "px"
                        );

                }
            )

            .on(
                "mouseout",
                function() {

                    d3.select(this)

                        .transition()

                        .attr(
                            "r",
                            5
                        );


                    tooltip.style(
                        "opacity",
                        0
                    );

                }
            );

    }


    /* =================================
       START DASHBOARD
    ================================= */

    updateDashboard();


})


.catch(
    function(error) {

        console.error(
            "ไม่สามารถโหลดข้อมูลได้:",
            error
        );

    }
);
