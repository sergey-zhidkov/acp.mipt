import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;

class Main002 {
    public static void main(String args[]) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] set1 = br.readLine().split("\\s+");
        String[] set2 = br.readLine().split("\\s+");

        int [] intSet1 = new int[set1.length - 1];
        int [] intSet2 = new int[set2.length - 1];

        for (int i = 0; i < intSet1.length; i++) {
            intSet1[i] = Integer.parseInt(set1[i]);
        }
        for (int i = 0; i < intSet2.length; i++) {
            intSet2[i] = Integer.parseInt(set2[i]);
        }

        Arrays.sort(intSet1);
        Arrays.sort(intSet2);
        int previous = -1;
        int current;
        int key;
        StringBuilder resultSet = new StringBuilder();
        for (int i = 0; i < intSet1.length; i++) {
            current = intSet1[i];
            if (current == previous) {
                continue;
            }
            key = Arrays.binarySearch(intSet2, current);
            if (key < 0) {
                continue;
            }
            resultSet.append(current).append(" ");
            previous = current;
        }
        if (resultSet.length() == 0) {
            System.out.println("empty");
        } else {
            System.out.println(resultSet.toString());
        }
    }
}

