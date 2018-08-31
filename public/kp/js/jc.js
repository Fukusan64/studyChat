let __jc_selector_cache = [];

let jc = (selector, force = false) => {
    if ((force === true) || (__jc_selector_cache[selector] === undefined))
    {
        __jc_selector_cache[selector] = $(selector);
    }
    
    return __jc_selector_cache[selector];
};
