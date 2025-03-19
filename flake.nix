{
  description = "A basic flake to with flake-parts";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixpkgs-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    git-hooks-nix.url = "github:cachix/git-hooks.nix";
    devenv.url = "github:cachix/devenv";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{
      self,
      systems,
      nixpkgs,
      flake-parts,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.treefmt-nix.flakeModule
        inputs.git-hooks-nix.flakeModule
        inputs.devenv.flakeModule
      ];
      systems = import inputs.systems;

      perSystem =
        {
          config,
          pkgs,
          system,
          ...
        }:
        let
          stdenv = pkgs.stdenv;

          rustPlatform = pkgs.makeRustPlatform {
            cargo = pkgs.rust-bin.nightly.latest.default;
            rustc = pkgs.rust-bin.nightly.latest.default;
          };

          gleam = rustPlatform.buildRustPackage rec {
            pname = "gleam";
            version = "1.9.0";
            auditable = false;
            doCheck = false;

            nativeBuildInputs = [ pkgs.git ];

            src = pkgs.fetchFromGitHub {
              owner = "gleam-lang";
              repo = pname;
              rev = "v${version}";
              hash = "sha256-+06ZxeBYxpp8zdpxGolBW8FCrCf8vdt1RO2z9jkDGbg=";
            };

            useFetchCargoVendor = true;
            cargoHash = "sha256-RV+AghBBCHjbp+rgQiftlHUPuzigMkvcQHjbs4Lewvs=";
          };

          # To make executable binary.
          executable = stdenv.mkDerivation {
            # Set executable binary name.
            pname = "executable";
            version = "0.0.1";
            # Specify source path. You must specify the file added with `git add`.
            src = ./.;

            # Write build commands. e.g. make, gcc, etc...
            buildPhase = '''';

            # Write build commands. e.g. install file $out/bin/file
            installPhase = '''';
          };

          # When execute `nix run`, print "Hello World!".
          # And execute `nix build` to make execute at `./result/bin/hello`.
          hello = stdenv.mkDerivation {
            pname = "hello";
            version = "0.1.0";
            src = pkgs.writeShellScriptBin "hello" ''
              echo Hello World!
            '';

            buildCommand = ''
              install -D $src/bin/hello $out/bin/hello
            '';
          };

          git-secrets' = pkgs.writeShellApplication {
            name = "git-secrets";
            runtimeInputs = [ pkgs.git-secrets ];
            text = ''
              git secrets --scan
            '';
          };
        in
        {
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            overlays = [
              inputs.rust-overlay.overlays.default
              # (final: prev: {
              # })
            ];
            config = { };
          };

          # When execute `nix fmt`, formatting your code.
          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              nixfmt.enable = true;
            };

            settings.formatter = { };
          };

          pre-commit = {
            check.enable = true;
            settings = {
              hooks = {
                treefmt.enable = true;
                ripsecrets.enable = true;
                git-secrets = {
                  enable = true;
                  name = "git-secrets";
                  entry = "${git-secrets'}/bin/git-secrets";
                  language = "system";
                  types = [ "text" ];
                };
              };
            };
          };

          # When execute `nix develop`, you go in shell installed nil.
          devenv.shells.default = {
            packages = with pkgs; [
              esbuild

              nil
            ];

            # Specify languages like this.
            # There is a limit to the number of languages for which the version attribute can be specified.
            languages = {
              gleam = {
                enable = true;
                package = gleam;
              };
              erlang = {
                enable = true;
              };
              javascript = {
                enable = true;
                bun.enable = true;
              };
              deno = {
                enable = true;
              };
            };

            enterShell = '''';
          };

          packages.default = hello;
        };
    };
}
