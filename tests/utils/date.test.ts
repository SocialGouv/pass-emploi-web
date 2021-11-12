import {isDateOlder} from 'utils/date';

describe(("dateUtils"), () => {
    it('isDateOlder renvoie true si la date est plus ancienne', () => {
        const dateAvant = new Date('Thu, 21 Oct 2021 10:01:19 GMT')
        const dateApres = new Date('Thu, 21 Oct 2021 10:01:20 GMT')

        const isOlder = isDateOlder(dateAvant, dateApres)

        expect(isOlder).toBeTruthy();
    });

})