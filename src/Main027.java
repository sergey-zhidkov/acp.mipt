import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;

class Main027 {
    public static void main(String args[]) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int length = Integer.parseInt(br.readLine());
        String[] stringOfNumbers = br.readLine().split("\\s+");
        Arrays.sort(stringOfNumbers);

        int count = 2;
        String current;
        String previous = "";
        for (int i = 0; i < stringOfNumbers.length; i++) {
            current = stringOfNumbers[i];
            if (current.equals(previous)) {
                count++;
            } else {
                if (count % 2 != 0) {
                    break;
                }
                count = 1;
                previous = current;
            }
        }

        System.out.println(previous);
    }
}

