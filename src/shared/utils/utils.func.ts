export class UtilsFunc
{

    static getWinnerCriteriaDifference(array1, array2) {
        return array1.filter(object1 => {
          return !array2.some(object2 => {
            return object1.name === object2.name;
          });
        });
    }
    arrayDiffWinnerCriteria(array1,array2)
    {
        return [...UtilsFunc.getWinnerCriteriaDifference(array1,array2),...UtilsFunc.getWinnerCriteriaDifference(array2,array1)]
    }
}