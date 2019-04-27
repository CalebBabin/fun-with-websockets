const hueHasher = (id, wrap = true) => {
    while(id > 360) id -= 360;
    if (wrap)
        return `hsl(${id}, 100%, 50%)`;
    else 
        return id;
}

module.exports = hueHasher;