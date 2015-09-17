/* package whatever; // don't place package name! */

import java.io.BufferedReader;
import java.io.InputStreamReader;

/* Name of the class has to be "Main" only if the class is public. */
class DevDraft02
{
    public static void main (String[] args) throws java.lang.Exception
    {
//        11
//        0 0 4 1 0 2 0 1 0 0 3

        // test purpose only
//        int lineLength = 11;
//        int[] dominoHeights = new int[]{0, 0, 4, 1, 0, 2, 0, 1, 0, 0, 3};

//        12
//        2 3 0 0 0 0 0 6 10 1 0 2

//        int lineLength = 12;
//        int[] dominoHeights = new int[]{2, 3, 0, 0, 0, 0, 0, 6, 10, 1, 0, 2};

//      parse data
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int lineLength = Integer.parseInt(br.readLine());
        String[] dominoHeightsString = br.readLine().split("\\s+");
        int[] dominoHeights = new int[lineLength];
        for (int i = 0; i < dominoHeightsString.length; i++) {
            dominoHeights[i] = Integer.parseInt(dominoHeightsString[i]);
        }

        int[] rightCascadeDistances = new int[lineLength];
        int[] leftCascadeDistances = new int[lineLength];
        // go from left to right, calculate and cache values
        for (int position = lineLength - 1; position >= 0; position--) {
            rightCascadeDistances[position] = findCascadeDistance(dominoHeights, rightCascadeDistances, position);
        }

        dominoHeights = reverseArray(dominoHeights);

        for (int position = lineLength - 1; position >= 0; position--) {
            leftCascadeDistances[position] = findCascadeDistance(dominoHeights, leftCascadeDistances, position);
        }

        // print output
        StringBuilder outSb = new StringBuilder();
        for (Integer cascadeDistance: rightCascadeDistances) {
            outSb.append(cascadeDistance).append(" ");
        }
        System.out.println(outSb.toString().trim());

        outSb = new StringBuilder();
        for (int i = leftCascadeDistances.length - 1; i >= 0; i--) {
            outSb.append(leftCascadeDistances[i]).append(" ");
        }
        System.out.println(outSb.toString().trim());
    }

    public static int findCascadeDistance(int[] dominoHeights, int[] cascadeDistances, int position) {
        int currentHeight = dominoHeights[position];
        // is this last domino?
        if (currentHeight == 0) {
            return currentHeight;
        }
        // check each before on the length of current height of this domino
        return getMaximumCascadeDistance(cascadeDistances, position, currentHeight);
    }

    public static int getMaximumCascadeDistance(int[] cascadeDistances, int position, int height) {
        int len = cascadeDistances.length;
        int from = position;
        int to = position + height;
        if (to >= len) {
            to = len - 1;
        }

        int maximumCascadeDistance = height;
        int maximumCascadeDifference = position - from; // 0
        for (int i = from; i <= to; i++) {
            int difference = i - position;
            int cascadeDistance = cascadeDistances[i];
            if (maximumCascadeDistance + maximumCascadeDifference < cascadeDistance + difference) {
                maximumCascadeDistance = cascadeDistance;
                maximumCascadeDifference = difference;
            }
        }

        return maximumCascadeDistance + maximumCascadeDifference;
    }

    public static int[] reverseArray(int[] array) {
        int temp;
        int len = array.length;
        int halfLen = len / 2;
        for (int i = 0; i < halfLen; i++) {
            temp = array[i];
            array[i] = array[len - i - 1];
            array[len - i - 1] = temp;
        }
        return array;
    }
}