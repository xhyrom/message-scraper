export const textBreakLineSplit = (node, document, text) => {
    const t = text.split(/\s*<br ?\/?>\s*/i);

    if (t[0].length > 0) node.appendChild(document.createTextNode(t[0]));
    for (let i=1; i < t.length; i++){
        node.appendChild(document.createElement('BR'));
        if (t[i].length > 0) node.appendChild(document.createTextNode(t[i]));
    } 
}