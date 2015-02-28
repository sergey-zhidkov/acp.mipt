import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

class Main026Papkov {
    public static void main(String args[]) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int number = Integer.parseInt(br.readLine());

        if (number < 3) {
            System.out.println(number);
            return;
        }

        if ((number & (number - 1)) == 0) {
            System.out.println(findPowerOfTwo(number) + 1);
            return;
        }

        System.out.println("myCount:");
        System.out.println(count(number));
        System.out.println("PapkovCount:");
        System.out.println(papkovCount(number));
    }

    static int count(int number) {
        if (number < 3) {
            return number;
        } else if (number % 2 != 0) {
            int count1 = count(number - 1);
            int count2 = count(number + 1);
            return count1 > count2 ? count2 + 1 : count1 + 1;
        } else {
            return count(number / 2) + 1;
        }
    }

    static int papkovCount(int number) {
        if (number < 3) {
            return number;
        } else if (number % 2 == 0) {
            return papkovCount(number / 2) + 1;
        } else {
            int count1 = countZeroes(number + 1);
            int count2 = countZeroes(number - 1);

            if (count2 < count1) {
                return papkovCount(number + 1) + 1;
            } else {
                return papkovCount(number - 1) + 1;
            }
        }
    }

    static int countZeroes(int number) {
        String strNumber = Integer.toBinaryString(number);
        int index = strNumber.indexOf("1");
        int result = 0;
        for (int i = index + 1; i < strNumber.length(); i++) {
            char ch = strNumber.charAt(i);
            if (ch == '0') {
                result++;
            }
        }
        return result;
    }

    static int findPowerOfTwo(int number) {
        int res = 0;
        while (number != 1) {
            number >>= 1;
            res++;
        }
        return res;
    }
}

