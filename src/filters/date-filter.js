const dayjs = require('dayjs');
const advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

module.exports = value => {
    const dateObject = dayjs(value);
    return `${dateObject.format('Do')} of ${dateObject.format('MMMM YYYY')}`;
};