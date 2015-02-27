import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

class Main201 {
    public static void main(String args[]) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int numberOfSolutions = 0;

        int maxX1 = n;
        int maxX2 = n / 2;
        int maxX3 = n / 3;
        int maxX4 = n / 4;
        int res1;
        int res2;
        int res3;
        int res4;
        mainLoop: for (int i = 0; i <= maxX4; i++) {
            res1 = 4 * i;
            if (res1 == n) {
                numberOfSolutions++;
            }
            if (res1 >= n) {
                break;
            }
            for (int j = 0; j <= maxX3; j++) {
                res2 = res1 + 3 * j;
                if (res2 == n) {
                    numberOfSolutions++;
                }
                if (res2 >= n) {
                    break;
                }
                for (int k = 0; k <= maxX2; k++) {
                    res3 = res2 + 2 * k;
                    if (res3 == n) {
                        numberOfSolutions++;
                    }
                    if (res3 >= n) {
                        break;
                    }
                    for (int m = 0; m <= maxX1; m++) {
                        res4 = res3 + m;
                        if (res4 == n) {
                            numberOfSolutions++;
                        }
                        if (res4 >= n) {
                            break;
                        }
                    }
                }
            }
        }
        System.out.println(numberOfSolutions);
    }
}

