import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

class Main001 {
    public static void main(String args[]) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] array = br.readLine().split("\\s+");
        int maxNum = Integer.MIN_VALUE;
        int nextNum;
        for (int i = 0; i < array.length; i++) {
            nextNum = Integer.parseInt(array[i]);
            if (nextNum > maxNum) {
                maxNum = nextNum;
            }
        }

        System.out.println(maxNum);
    }
}

