function firebotRootUrl() {
    return `http://localhost:7472/`;
}

function firebotApiRootUrl() {
    return firebotRootUrl() + 'api/v1';
}

function zunderstreamAdminRootUrl() {
    return firebotRootUrl() + 'integrations/zunderstream';
}

async function getFirebotCustomVariable(variableName) {
    let url = `${firebotApiRootUrl()}/custom-variables/${variableName}`;

    const response = await fetch(url);

    return await response.text();
}

async function setFirebotCustomVariable(variableName, value, ttl) {
    let url = `${firebotApiRootUrl()}/custom-variables/${variableName}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: value, ttl: ttl })
    });
}

function setElementContents(elementId, contents) {
    document.getElementById(elementId).innerHTML = contents;
}

function setElementText(elementId, contents) {
    document.getElementById(elementId).innerText = contents;
}