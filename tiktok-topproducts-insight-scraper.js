const apiUrl = "https://ads.tiktok.com/creative_radar_api/v1/product/list?limit=20&last=30&country_code=ID&ecom_type=l3&period_type=last&order_by=post&order_type=desc";
const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "lang": "en",
    "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",

    "timestamp": "1691175478",
    "user-sign": "f071f0960071197f",
    "web-id": "7257102651983234562",
    "x-csrftoken": "hqjTsSnXlzLuwvE8NNRZFAYSlJlV1ovu"
};

// Helper function to fetch data with a sleep delay
async function fetchDataWithDelay(url, headers, delay) {
    return new Promise((resolve) => {
        setTimeout(async () => {
            const response = await fetch(url, {
                headers,
                referrer: "https://ads.tiktok.com/business/creativecenter/top-products/pc/en",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "GET",
                mode: "cors",
                credentials: "include"
            });
            const data = await response.json();
            resolve(data);
        }, delay);
    });
}

// Function to handle pagination and get all data with a sleep delay
async function getAllDataWithDelay(apiUrl, headers, delay, maxRetries) {
    let allData = [];
    let page = 1;
    let retries = 0;

    while (true) {
        try {
            console.log("Scraping page " + page)
            const response = await fetchDataWithDelay(`${apiUrl}&page=${page}`, headers, delay);
            const list = response.data.list;
            const has_more = response.data.pagination.has_more;

            // Add the current page data to the allData array
            allData = allData.concat(list);

            if (!has_more) {
                // Break the loop if there's no more data
                break;
            }

            // Increment the page number for the next request
            page++;
            retries = 0; // Reset retries if the request is successful
        } catch (error) {
            console.error("Error fetching data:", error);
            retries++;

            // Break the loop if the maximum number of retries is reached
            if (retries >= maxRetries) {
                console.error(`Exceeded maximum retries (${maxRetries}). Stopping data retrieval.`);
                break;
            }

            // Add an additional delay before the next retry (5000 ms = 5 seconds)
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    return allData;
}

// Call the function to get all data with a sleep delay of 1000 ms (1 second) between requests
getAllDataWithDelay(apiUrl, headers, 1000, 5)
    .then((allData) => {
        // Process the complete data here
        console.log(allData);


        const headers = [
            "Comment", "Cost", "Cover URL", "CPA", "CTR",
            "CVR", "Ecom Type", "First Ecom Category", "Impression",
            "Like", "Play Six Rate", "Post", "Post Change",
            "Second Ecom Category", "Share", "Third Ecom Category", "URL Title"
        ];

        // Convert each item to a CSV row
        const csvRows = allData.map((item) => {
            return [
                item.comment,
                item.cost,
                item.cover_url,
                item.cpa,
                item.ctr,
                item.cvr,
                item.ecom_type,
                item.first_ecom_category.value,
                item.impression,
                item.like,
                item.play_six_rate,
                item.post,
                item.post_change,
                item.second_ecom_category.value,
                item.share,
                item.third_ecom_category.value,
                item.url_title
            ].map((value) => `"${value}"`).join(",");
        });

        // Combine headers and rows
        const csvContent = [headers.join(","), ...csvRows].join("\n");

        // Function to download the CSV file
        function downloadCSV(content, filename) {
            console.log("Downloading..")
            const blob = new Blob([content], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            console.log("File Downloaded !")
        }
        downloadCSV(csvContent, "explore-top-productdata.csv");

    })
    .catch((error) => {
        console.error("Error fetching data:", error);
    });
