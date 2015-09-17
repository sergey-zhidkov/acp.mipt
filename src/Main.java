public class Main {

    public static void main(String[] args) {
        new Thread() {
            @Override
            public void run() {
                new A();
                System.out.println(2);
            }
        }.start();

        new B();
        System.out.println(1);
    }

}

class A {
    public final static A DEFAULT_IMPLEMENTATION = new B();
}

class B extends A {

}