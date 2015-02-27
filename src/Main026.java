import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

class Main026 {
    public static void main(String args[]) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int number = Integer.parseInt(br.readLine());
        int numberOfOperations = 0;

        if (number < 3) {
            System.out.println(number);
            return;
        }

        if ((number & (number - 1)) == 0) {
            System.out.println(findPowerOfTwo(number) + 1);
            return;
        }

        System.out.println(count(number));
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

    static int findPowerOfTwo(int number) {
        int res = 0;
        while (number != 1) {
            number >>= 1;
            res++;
        }
        return res;
    }
}

