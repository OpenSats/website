/**
* @param {string} amount - A string representation of satoshis  
* @returns {string} - Returns a string representation of the amount in BTC notation 
*/
export default function convertToBtc(amount: string): string | null {
        // convert and round amount to integer - must use parseInt here
        const parseAmount = parseInt(amount, 10);
        const roundedAmount  = Math.round(parseAmount);

        let btcAmount: string;

        if (!Number.isNaN(roundedAmount)) {
            const leadingZeros = 9  
            // calculate leading zeros required
            // add leading zeros to rounded amount 
            const addZeros = `0`.repeat(Math.max(leadingZeros - roundedAmount.toString().length, 0)) + roundedAmount;
            // add period leaving 8 decimals places 
            const addDecimalPoint = addZeros.replace(/(\d+)(\d{8})$/,
                                                     (match, part1, part2) => `${part1}.${part2}`);

            // additonal formating for large amounts - add required commas
            const [integerPart, decimalPart] = addDecimalPoint.split('.');
            const formatLocale = Number(integerPart).toLocaleString();
            
            btcAmount = `${formatLocale}.${decimalPart}`;
        } else {
            return null;
        }
        return btcAmount;
}

